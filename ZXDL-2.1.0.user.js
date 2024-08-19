//ZXDL SCRIPT 2.0.0 - By ErikV7 fix by zooanon
//SCRIPT AS JAVASCRIPT CODE

// ==UserScript==
// @name ZXDL
// @namespace http://zoox18.com/
// @version 2.1.0
// @description View and download private videos from ZX18.
// @author Low & ErikV7 & Anonpony & zooanon
// @match http*://*.zoox18.com/*
// @grant GM_listValues
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_deleteValue
// @grant GM_xmlhttpRequest
// @grant GM_info
// @grant GM_openInTab
// @grant GM_setClipboard
// @grant GM_registerMenuCommand
// @grant GM_unregisterMenuCommand
// @grant GM_notification
// @grant GM_download
// @grant GM.info
// @grant GM.listValues
// @grant GM.setValue
// @grant GM.getValue
// @grant GM.deleteValue
// @grant GM.openInTab
// @grant GM.setClipboard
// @grant GM.xmlHttpRequest
// @require http://ajax.googleapis.com/ajax/libs/jquery/3.5.0/jquery.min.js
// @require https://cdn.plyr.io/3.6.3/plyr.js
// @run-at document-end
// ==/UserScript==

// Inject
var downloading = false;
var found = false;
var isPrivateWindow = false;
var id = window.location.pathname.split("/")[2];
var vidUrl = '';
var uploader = 'Unknown';
var title = 'Unknown';
var $ = window.jQuery;
var Plyr = window.Plyr;

$('.navbar').after('<div class="container" id="rip-div" style="width: 560px;"></div>');
$('.top-menu > .pull-left').append('<li>ZXDL 2.0.0 - By Low & ErikV7</li>');

// Remove annoyances
document.querySelectorAll('.img-private').forEach(elm => (elm.style.filter = 'brightness(1)'));
document.querySelectorAll('.label-private').forEach(elm => (elm.style.filter = 'opacity(0.5)'));

// Functions
function formatBytes(a,b=2) {
    if (0===a) return "0 bytes";
    const c=0>b?0:b,d = Math.floor(Math.log(a) / Math.log(1024));
    return parseFloat((a / Math.pow(1024, d)).toFixed(c)) + " " +["bytes","KB","MB","GB"][d];
}

function dl_progress(res) {
    if (res.lengthComputable === false) return;
    $('#dl-data').html(formatBytes(res.done) +' / '+ formatBytes(res.total));
    $('#dl-bar').attr("aria-valuenow", Math.floor(res.done / res.total * 100));
    $('#dl-bar').css("width", Math.floor(res.done / res.total * 100) + "%");
    $('#dl-bar').html(Math.floor(res.done / res.total * 100) + "%");
}

function dl_load(res) {
    if (res.lengthComputable === false) return;
    $('#dl-data').html("Complete!");
    $('#dl-bar').addClass("progress-bar-success");
}

function dl_error(res) {
    if (res.lengthComputable === false) return;
    $('#dl-data').html("Oops, there was an error. Refresh page to try again");
    $('#dl-bar').addClass("progress-bar-danger");
}

// Path list
var paths =[];
var base = ["https://md.zoox18.com/", "https://md1.zoox18.com/", "https://md2.zoox18.com/", "https://media.zoox18.com/", "https://media1.zoox18.com/", "https://media2.zoox18.com/", "https://media.dir.xxx/", "https://media1.dir.xxx/", "https://media2.dir.xxx/"];
var keys = ["Afgf8121k", "Iu528sZA", "_asaA34343BN", "082GhjMswdfd3", "HBa23r27ALss", "Iyw9ew27KhgS", "_9121BghguS", "034343sdsA_", "0Gbg3Ga",];
paths.push("https://www.zoox18.com/media/videos/h264/"+id+"_SD.mp4")
for(var i = 0; i < keys.length; i++){
    var key = keys[i];
    for(var ii = 0; ii < base.length; ii++){
        //h264 mp4 paths
        paths.push(base[ii]+key+"/media/videos/h264/"+id+"_SD.mp4");
        paths.push(base[ii]+key+"/media/videos/h264/"+id+"_HD.mp4");
        //Iphone redundancy
        //paths.push(base[ii]+key+"/media/videos/iphone/"+id+"_SD.mp4");
    }
}

function scan(url) {
    if (found == false){
        var v = document.createElement('VIDEO');
        v.addEventListener('loadeddata', function () { // If video found
            console.log('ZXDL: Video found! ' + url);
            found = true;
            vidUrl = url;

            if (isPrivateWindow){
                $('#rip-div').html('<h1>'+title+'</h1><p>Uploaded by <a href="https://zoox18.com/user/'+uploader+'">'+uploader+'</a></p><link rel="stylesheet" href="https://cdn.plyr.io/3.5.6/plyr.css" /><video style="width: 100%; height: 100%;" poster="https://www.zoox18.com/media/videos/tmb1/'+id+'/default.jpg" id="rippedvid" playsinline controls><source src="'+vidUrl+'" type="video/mp4" /></video><div><hr><button id="zxdl_favorite" class="btn btn-primary"><i class="glyphicon glyphicon-heart"></i> Favorite</button> <button id="zxdl_download" class="btn btn-primary"><i class="glyphicon glyphicon-download"></i> Download (beta)</button><p id="status"></p><div id="dl-progress" class="well" style="display: none"></div></div>');
                var controls = ['play-large', 'play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'];
                var player = new Plyr('#rippedvid', { controls });

                $('#zxdl_favorite').click(function() { // Favorite button for private videos
                    $('#status').html('Please wait...');
                    var http = new XMLHttpRequest();
                    var url = 'https://www.zoox18.com/ajax/favorite_video';
                    var form = 'video_id='+ id;
                    http.open('POST', url, true);
                    http.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
                    http.onreadystatechange = function() {
                        if(http.readyState == 4 && http.status == 200) {
                            const response = http.responseText;
                            if (response.includes('alert-danger')) {
                                $('#status').html('Couldn\'t favorite video. Are you logged in? Is this video already in your favorites?');
                            } else if (response.includes('alert-success')) {
                                $('#status').html('<span style="color:#77b300">Added to favorites!</span>');
                            } else {
                                $('#status').html('The site returned unknown data.');
                            }
                        }
                    };
                    http.send(form);
                });
            } else {
                // Replace download button on public videos
                $('div#share_video').append('<button id="zxdl_download" class="btn btn-primary m-l-5"><i class="glyphicon glyphicon-download"></i></button><p id="status"></p>');
                $('#response_message').after('<div id="dl-progress" class="well" style="display: none"></div>');
                $('button.btn.btn-default.dropdown-toggle').remove();
            }

            $('#zxdl_download').click(function() {
                if (downloading === false){
                    downloading = true;
                    $('#dl-progress').css('display','block');
                    $('#dl-progress').html('This feature is still being worked on! Not all videos or browsers may support this method.<hr><h4>Progress</h4><span id="dl-data">Loading...</span> <div class="progress"><div id="dl-bar" class="progress-bar progress-bar-striped" role="progressbar" aria-valuenow="0" aria-valuemin="0" aria-valuemax="100" style="width: 0%"></div></div>');
                    GM_download({
                        url: url,
                        name: id + ".mp4",
                        onprogress: dl_progress,
                        onload: dl_load,
                        onerror: dl_error
                    });
                } else {
                    alert('You\'ve already initiated a download. Refresh the page to try again.');
                }
            });
        });
        v.src = url;
    }
}

// On load
function init() {
    if ($("span").hasClass("text-danger") == true) { // If private video page active
        isPrivateWindow = true;
        uploader = $('.text-danger a').text().replace("Upgrade to Premium Account","");
        title = $("meta[property='og:title']").attr("content");
        if (window.location.pathname.split("/")[1] == "video") {
            $('.well.well-sm').remove(); // Remove notice
            $('.well.ad-body').remove(); // Remove sponsor block for non-ad-blockers
            $('#rip-div').html('<h1>Scanning for video '+id+'...</h1><p>This can take up to a minute. If it takes longer, please check your browser\'s console for errors.</p>');
            paths.forEach(scan);
        }
    }
    else if($('#wrapper .container .row .col-md-8 .vcontainer ').length > 0) { // If public video page active
        paths.forEach(scan);
    }
}
window.addEventListener('load', init, false);