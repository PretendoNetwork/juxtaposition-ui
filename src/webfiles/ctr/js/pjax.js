/*
pjax CTR
   Written By: Jemma
 */
var hist = [window.location];

window.pjax = {
    loadUrl: function(url) {
        cave.transition_begin();
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                hist.push(url);
                document.getElementById("main").innerHTML = this.responseText;
                cave.transition_end();
                onPageLoad();
            }
            else if(this.readyState === 4) {
                cave.error_callFreeErrorViewer(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing ' + this.readyState);
                cave.transition_end();
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    },
    back: function() {
        if(!this.canGoBack())
            return;
        cave.transition_begin();
        hist.pop();
        var url = hist[hist.length - 1]
        var xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                document.getElementById("main").innerHTML = this.responseText;
                cave.transition_end();
                onPageLoad();
            }
            else if(this.readyState === 4) {
                cave.error_callFreeErrorViewer(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send code to Jemma on Discord with what you were doing ' + this.readyState);
                cave.transition_end();
            }
        };
        xhttp.open("GET", url, true);
        xhttp.send();
    },
    canGoBack: function () {
        //alert(hist.length);
        if(hist.length <= 1) {
            cave.toolbar_setButtonType(0);
            return false;
        }
        else {
            cave.toolbar_setButtonType(1);
            return true;
        }
    }
};