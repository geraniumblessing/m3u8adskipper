// m3u8adskipper.js
// ================
var exec = require('child_process').exec;
var fs = require('fs');

exports.version = "0.1.0";

var endsWith = function(str, suffix) 
{
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
}

exports.skip = function(masterPlayListFile, skipAds, outputFile)
{
    var res = masterPlayListFile.split("/");
    var rootDir = masterPlayListFile.replace(res[res.length-1],'');
    console.log("masterPlayListFile is " + masterPlayListFile);
    console.log("skipAds is " + skipAds);
    console.log("root directory is " + rootDir);
    var content = fs.readFileSync(masterPlayListFile, 'utf-8'); 
    var masterPlayListContents = content.split("\n");
    for(i in masterPlayListContents) 
    {
        if(endsWith(masterPlayListContents[i],"m3u8"))
        {
            var res2 = masterPlayListContents[i].split("/");
            var playListDir = rootDir + masterPlayListContents[i].replace(res2[res2.length-1],'');
            var content2 = fs.readFileSync(rootDir + masterPlayListContents[i], "utf-8"); 
            var mediaPlayListContents = content2.split("\n");
            var k = -1;
            var mediaSegments = new Array();
            var command = "ffmpeg -loglevel quiet -i ";
            for(j in mediaPlayListContents) 
            {
                if(endsWith(mediaPlayListContents[j],"ts"))
                {
                    mediaSegments[++k] = playListDir + mediaPlayListContents[j]; 
                }
           }
           k = 0;
           var concatParam = '"concat:';
           for(k in mediaSegments)
           {
              if(k != 0)
                  concatParam += '|';
              concatParam += mediaSegments[k];
           }
           concatParam += '"';
           outputFileName = playListDir + outputFile;
           if(concatParam != '"concat:"')
           {
              // the -bsf:a option is required for handling malformed aac bitstream
              // ==================================================================
              command += concatParam + ' -bsf:a aac_adtstoasc  -c copy -f mp4 ' + outputFileName;
              var child = exec(command, function(err, stdout, stderr)
              {
                  if (stderr) console.log('error',stderr);
                  console.log("successfully executed command " + command);
              });
           }
       }
   }
}