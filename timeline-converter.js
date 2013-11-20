/*
 * converts a dipity timeline to timelineJS compatible format
 *
 * usage:
 * node dipity2timeline.js infile
 *
 * infile should be a dipity json source file
 */

var args = process.argv.splice(2);
if (!args[0]) {
    console.log("please specify an input file as an argument");
    return;
}
var btoa = require('btoa');
var fs = require('fs');
var exec = require('child_process').exec;
var infile = args[0];

function wget_image(url) {
    if (url == null)
        return url;

    var dir = "images";
    fs.mkdir(dir, function(e) {});
    var filename = dir + "/" + encodeURIComponent(url) + ".jpg";

    wget("http://free.pagepeeker.com/v2/thumbs_ready.php?size=x&url=" +
            encodeURIComponent(url.replace(/http[s]?:\/\//, "")), "/dev/null");
    wget("http://free.pagepeeker.com/v2/thumbs.php?size=x&url=" +
            encodeURIComponent(url.replace(/http[s]?:\/\//, "")), filename);

    return filename;
}
function wget(url, filename) {
    console.log("downloading " + url);
    exec("wget -O '" + filename + "' '" + url + "'", function(error, stdout, stderr) {
        if (error != null)
            console.log("wget error: " + error);
    });
}

// Have I already said “error handling is for pussies?”
var input = fs.readFile(infile, function(err,data) {
    var input = JSON.parse(data);
    var output = {};
    output.events = [];

    for (item in input.events) {
        item = input.events[item];
        // download preview image
        image = wget_image(item.asset.media);

        eintrag = {};
        eintrag.startDate = item.startDate;
        eintrag.endDate = item.endDate;
        eintrag.headline = item.headline;
        eintrag.text = item.text;

        eintrag.asset = {};
        eintrag.asset.media = item.asset.media;
        // eintrag.asset.thumbnail = image;
        eintrag.asset.credit = item.asset.media; // just the link for now
        eintrag.asset.caption = item.headline; // just the title for now

        output.events.push(eintrag);
    }

    fs.writeFile("timeline-import.json", JSON.stringify(output, null, "\t"), function(err) {
        if (err)
            console.log(err);
    });
});
