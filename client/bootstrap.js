Meteor.startup(function() {

    HTTP.call("GET", "http://localhost:3000/1942.cdt",
        { responseType: "arraybuffer"},
        function (error, result) {
            var cdt = new CDT2WAV(result.content);
            console.log(cdt.countBlocks());
        });

});