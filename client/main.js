
const web3 = new Web3(Web3.givenProvider);

var contract;
var networkId;
var deployedAddress;
var coinAnimation;
var coinAction = [
    { transform: 'scale3d(1, 1, 1) rotateX(0deg)' },
    {
        transform: 'scale3d(1, 1, 1) rotateX(180deg)',
    },
    { transform: 'scale3d(1, 1, 1) rotateX(360deg)' }
];
var coinTiming = {
    duration: 500,
    iterations: Infinity
};

$(document).ready(() => {
        web3.eth.requestAccounts()//Requests Metamask access and returns a promise
        .then(accounts => {
            web3.eth.net.getId().then(id => {networkId = id});
            $.getJSON('./Coinflip.json').then(res => {
                deployedAddress = res.networks[networkId].address;
                contract = new web3.eth.Contract(abi, deployedAddress, { from: accounts[0] });
            }).then(() => {
                contract.events.betPlaced()
                .on('data', event => {
                    if (event.returnValues.gameWin == true) {
                        $(".progress-bar").attr({ style: 'width: 100%', 'aria-valuenow': 100 });
                        $(".progress-bar").text("Complete!");
                        coinAnimation.cancel();
                        var winAlert = '<div class="alert alert-success alert-dismissible fade show" id="game-win" role="alert"><strong>You won!</strong> You get two times your bet!<button type="button" class="close" data-dismiss="alert" aria-label="Close" <span aria-hidden="true">&times;</span></button></div>'
                        $(".input-group").before(winAlert);
                        $('#game-win').on('closed.bs.alert', () => {
                            $(".progress-bar").attr({ style: 'width: 0%', 'aria-valuenow': 0 });
                        });
                    } else {
                        $(".progress-bar").attr({ style: 'width: 100%', 'aria-valuenow': 100 });
                        $(".progress-bar").text("Complete!");
                        coinAnimation.currentTime = coinTiming.duration / 2;
                        coinAnimation.pause();
                        var loseAlert = '<div class="alert alert-danger alert-dismissible fade show" id="game-loss" role="alert"><strong>Sorry, you lost.</strong> Better luck next time.<button type="button" class="close" data-dismiss="alert" aria-label="Close" <span aria-hidden="true">&times;</span></button></div>'
                        $(".input-group").before(loseAlert);
                        $('#game-loss').on('closed.bs.alert', () => {
                            $(".progress-bar").attr({ style: 'width: 0%', 'aria-valuenow': 0 });
                            coinAnimation.cancel();
                        });
                    }
                });
            });
        $("#flip-coin-button").click(sendData);   
        });
        
});



function sendData() {
    var amount = $("#bet-amount-input").val();
    var transactionConfig = {
        value: web3.utils.toWei(amount, "ether"), gas: 6721975,
    }
    coinAnimation = document.getElementById("coin").animate(coinAction, coinTiming);
    $("#bet-amount-input").val('');
    contract.methods
        //Create, configure, and send transaction
        .flipCoin().send(transactionConfig)
        // listen for a response
        .on("transactionHash", function (hash) {
            $(".progress-bar").attr({ style: 'width: 33%', 'aria-valuenow': 33 });
            $(".progress-bar").text("Waiting for transaction confirmations...")
        })
        .on("confirmation", function (confirmationNr) {

        })
        .on("receipt", function (receipt) {
            //Something that we get when a transaction is put into a block for the first time and it tells us the outcome of the transaction
            $(".progress-bar").attr({ style: 'width: 66%', 'aria-valuenow': 66 });
            $(".progress-bar").text("Consulting the Provable oracle");
            
        });
    
}
