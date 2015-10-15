Meteor.startup(function() {

    /*HTTP.call("GET", "http://meteor.local/1942.cdt",
        { responseType: "arraybuffer"},
        function (error, result) {
            console.log('gota the file');
            var cdt = new CDT2WAV(result.content, 44100, true);
            console.log(cdt.countBlocks());
            cdt.convert();
            cdt.play();
            cdt.spectrum(document.getElementById('canv'));
        });*/

    console.log('start');

});

//www.cpcwiki.eu/index.php/Format:TAP_tape_image_file_format
//http://www.cpc-power.com/CdtView.php?fiche=4093&slot=13&rang=6#block41
//http://www.cpc-power.com/CdtView.php?fiche=185&slot=20&rang=0