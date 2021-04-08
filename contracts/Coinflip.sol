pragma solidity >=0.8.0;
pragma experimental ABIEncoderV2;
import "./Ownable.sol";
import "./provableAPI_0.6.sol";

contract Coinflip is Ownable, usingProvable {
    //Provable Constants
    uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

    //Variable Declarations
    uint256 public contractBalance;
    struct Session {
        uint256 playerBet;
        uint256 playerBalance;
        bool gameWin;
        uint256 listIndex;
    }

    mapping(address => Session) gameSessions;
    mapping(bytes32 => address) queryOwners;
    address[] public playerAccounts;

    //Event definitions
    event contractFunded(address owner, uint256 endowment);
    event LogNewProvableQuery(string description);
    event generatedRandomNumber(uint256 randomNumber);
    event betPlaced(address user, uint256 bet, bool gameWin);

    //Modifiers
    modifier costs(uint256 cost) {
        require(msg.value >= cost, "The minimum bet is .01 Ether");
        _;
    }

    //Randomness Functions
    constructor() public {
        provable_setProof(proofType_Ledger);
    }

    function update() public {
        uint256 QUERY_EXECUTION_DELAY = 0; // NOTE: The datasource currently does not support delays > 0!
        uint256 GAS_FOR_CALLBACK = 200000;
        bytes32 queryId =
            provable_newRandomDSQuery(
                QUERY_EXECUTION_DELAY,
                NUM_RANDOM_BYTES_REQUESTED,
                GAS_FOR_CALLBACK
            );
        queryOwners[queryId] = msg.sender;
        emit LogNewProvableQuery(
            "Provable query was sent, standing by for the answer..."
        );
    }

    function __callback(
        bytes32 _queryId,
        string memory _result,
        bytes memory _proof
    ) public override {
        require(msg.sender == provable_cbAddress());
        if (
            provable_randomDS_proofVerify__returnCode(
                _queryId,
                _result,
                _proof
            ) != 0
        ) {
            //proof verfication failure
            revert();
        } else {
            //proof verfication success
            uint256 randomNumber =
                uint256(keccak256(abi.encodePacked(_result))) % 2;
            address playerAddress = queryOwners[_queryId];
            uint256 playerBet = gameSessions[playerAddress].playerBet;
            if (randomNumber == 0) {
                contractBalance -= playerBet;
                payable(playerAddress).transfer(playerBet * 2);
                gameSessions[playerAddress].playerBalance += playerBet;
                gameSessions[playerAddress].gameWin = true;
            } else if (randomNumber == 1) {
                contractBalance += playerBet;
                gameSessions[playerAddress].gameWin = false;
            }
            delete queryOwners[_queryId];
            emit generatedRandomNumber(randomNumber);
            emit betPlaced(
                playerAddress,
                playerBet,
                gameSessions[playerAddress].gameWin
            );
        }
    }

    //Coinflip Contract Functions
    function isAccount(address playerAddress) private view returns (bool) {
        if (playerAccounts.length == 0) return false;
        return (playerAccounts[gameSessions[playerAddress].listIndex] ==
            playerAddress);
    }

    function getPlayerSession(address playerAddress)
        public
        view
        returns (Session memory)
    {
        return gameSessions[playerAddress];
    }

    function createSession(address _playerAddress, uint256 _playerBet)
        private
        returns (bool)
    {
        //Create new session object with address, bet, and list index
        //add session object to sessions mapping
        //add player address to player list
        playerAccounts.push(_playerAddress);
        Session memory newSession;
        newSession.playerBet = _playerBet;
        newSession.listIndex = playerAccounts.length - 1;
        newSession.gameWin = false;
        _insertSession(newSession);
    }

    function getAccounts() public view returns (address[] memory) {
        return playerAccounts;
    }

    function updateSession(address _playerAddress, uint256 _playerBet) private {
        gameSessions[_playerAddress].playerBet = _playerBet;
    }

    function _insertSession(Session memory _newSession) private {
        address creator = msg.sender;
        gameSessions[creator] = _newSession;
    }

    function flipCoin() public payable costs(0.01 ether) {
        require(
            address(this).balance >= msg.sender.balance,
            "Contract balance has insufficient funds. Please try again later."
        );

        if (isAccount(msg.sender) == false) {
            createSession(msg.sender, msg.value);
            update();
        } else {
            updateSession(msg.sender, msg.value);
            update();
        }
    }

    function fundContract() public payable onlyOwner {
        require(msg.value != 0);
        contractBalance += msg.value;
        emit contractFunded(msg.sender, msg.value);
    }

    function close() public onlyOwner {
        address payable ownerPayable = payable(owner);
        selfdestruct(ownerPayable);
    }
}
