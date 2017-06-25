import * as bip39 from 'bip39';

$('document').ready(() => {
    $('#phrase').on('keyup', (event) => {
        convert();
    });
    $('#convert').on('click', (event) => {
        convert();
    });
    console.info('#Ready');
});

function convert() {
    const p = <string>$('#phrase').val();
    if (bip39.validateMnemonic(p)) {
        $('#key').val(bip39.mnemonicToEntropy(p));
    } else {
        $('#key').val('not a valid phrase');
    }
    console.info('Convert done.');
}