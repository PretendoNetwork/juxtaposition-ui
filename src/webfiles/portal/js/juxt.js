var scrollPosition, pjax;
var updateCheck = setInterval(checkForUpdates, 10000);

/* global Pjax */
function initNavBar() {
    var buttons = document.querySelectorAll("li[data-pjax]");
    if (!buttons)
        return;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            for(var i = 0; i < buttons.length; i++) {
                if(buttons[i].classList.contains('selected'))
                    buttons[i].classList.remove('selected');
                if(buttons[i].getAttribute('data-pjax') === el.getAttribute("data-pjax"))
                    buttons[i].classList.add('selected');
            }
            wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
            wiiuBrowser.showLoadingIcon(!0)
            pjax.loadUrl(el.getAttribute("data-pjax"));
        });
    }
}
function initCommunities() {
    var buttons = document.querySelectorAll("div[data-pjax]");
    if (!buttons)
        return;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
            wiiuBrowser.showLoadingIcon(!0)
            pjax.loadUrl(el.getAttribute("data-pjax"));
        });
    }
}
function initNotifications() {
    var buttons = document.querySelectorAll("tr[data-pjax]");
    if (!buttons)
        return;
    for (var i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
            wiiuBrowser.showLoadingIcon(!0)
            pjax.loadUrl(el.getAttribute("data-pjax"));
        });
    }
}
function initCommunityUsers() {
    var users = document.querySelectorAll("img[data-pjax], span[data-pjax], h2[data-pjax]");
    if (!users)
        return;
    for (var i = 0; i < users.length; i++) {
        users[i].addEventListener("click", function(e) {
            var el = e.currentTarget;
            wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
            wiiuBrowser.showLoadingIcon(!0)
            pjax.loadUrl(el.getAttribute("data-pjax"));
        });
    }
}

console.log("Document initialized:", window.location.href);
document.addEventListener("pjax:send", function() {
    console.log("Event: pjax:send", arguments);
});
document.addEventListener("pjax:complete", function() {
    console.log("Event: pjax:complete", arguments);
    if(wiiuBrowser.canHistoryBack()) {
        document.getElementById('nav-bar-back').style.display = 'list-item';
        document.getElementById('nav-bar-exit').style.display = 'none';
    }
    else {
        document.getElementById('nav-bar-back').style.display = 'none';
        document.getElementById('nav-bar-exit').style.display = 'list-item';
    }
});
document.addEventListener("pjax:error", function() {
    wiiuErrorViewer.openByCodeAndMessage(5984000, 'Error: Unable to load element. \nPlease send the error code and what you were doing in');
});
document.addEventListener("pjax:success", function() {
    console.log("Event: pjax:success", arguments);
    // Init page content
    initNavBar();
    initCommunities();
    initNotifications();
    initCommunityUsers();
});
document.addEventListener("DOMContentLoaded", function() {
    // Init Pjax instance
    pjax = new Pjax({
        elements: [".js-Pjax"],
        selectors: ["#main", "#nav-bar", "title"],
        cacheBust: false
    });
    console.log("Pjax initialized.", pjax);

    // Init page content
    initNavBar();
    initCommunities();
    initNotifications();
    initCommunityUsers();
});

function stopLoading() {
    if (typeof wiiuBrowser !== 'undefined'
        && typeof wiiuBrowser.endStartUp !== 'undefined') {
        wiiuBrowser.endStartUp();
        wiiuSound.playSoundByName('BGM_OLV_MAIN', 3);
        setTimeout(function() {
            wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);
        },90000);
    }
}
function exit() {
    wiiu.gamepad.update()
    if(wiiu.gamepad.hold === 8192 || wiiu.gamepad.hold === 40960)
        alert('Debug Menu');
    else {
        wiiuSound.playSoundByName("SE_WAVE_EXIT", 1);
        wiiuBrowser.closeApplication();
    }
}
function back() {
    wiiuSound.playSoundByName('SE_WAVE_MENU', 1);
    wiiuBrowser.showLoadingIcon(!0);
    document.getElementById('nav-bar-back').classList.add('selected')
    if(wiiuBrowser.canHistoryBack()) {
        window.history.back();
    }
    else {
        document.getElementById('nav-bar-back').style.display = 'none';
        document.getElementById('nav-bar-exit').style.display = 'initial';
    }
}
function toggleOverlay() {
    var element = document.getElementById('windowOverlay');
    if(element.style.display === 'block') {
        wiiuSound.playSoundByName('SE_OLV_CANCEL', 1)
        wiiuSound.playSoundByName('BGM_OLV_MAIN_LOOP_NOWAIT', 3);

        element.style.display = 'none';
        document.getElementById('overlay-filter').style.display = '';
        document.getElementById('main').style.marginLeft = '190px';
        document.getElementById('nav-bar').style.display = '';
    }
    else {
        wiiuSound.playSoundByName('SE_OLV_OK', 1)
        wiiuSound.playSoundByName('BGM_OLV_SETTING', 3)

        element.style.display = 'block';
        document.getElementById('overlay-filter').style.display = 'none';
        document.getElementById('main').style.marginLeft = '110px';
        document.getElementById('nav-bar').style.display = 'none';
    }
}

function loadScreenShotData() {
    document.getElementById('post-top-screen-preview').src = 'data:image/png;base64,' + wiiuMainApplication.getScreenShot(true);
    document.getElementById('post-bottom-screen-preview').src = 'data:image/png;base64,' + wiiuMainApplication.getScreenShot(false);
}

function showNewPostScreen() {
    toggleOverlay();
    loadScreenShotData();
}

function yeah(postNode, postID) {
    wiiuBrowser.lockUserOperation(true);
    var yeahCountElement = document.getElementById('yeah-' + postID);
    var postElement = document.getElementById(postID);
    var yeahcount = yeahCountElement.innerHTML.substr(0, yeahCountElement.innerHTML.indexOf(' '));
    if (postNode.classList.contains("selected")) {
        postNode.classList.remove("selected");
        yeahCountElement.classList.remove("selected");
        postElement.classList.remove("selected");
        var params = "postID=" + postID + "&type=down";
        var xhr = new XMLHttpRequest();
        xhr.open("POST", '/posts/empathy', true);
        xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhr.send(params);
        if(yeahcount > 0) {
            yeahCountElement.innerHTML = --yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
            wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
            wiiuBrowser.lockUserOperation(false);
        }

    }
    else {
        postNode.classList.add("selected");
        yeahCountElement.classList.add("selected");
        postElement.classList.add("selected");
        var params = "postID=" + postID + "&type=up";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/posts/empathy', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                yeahCountElement.innerHTML = ++yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
                wiiuBrowser.lockUserOperation(false);
            }
            if (this.readyState === 4 && this.status === 423) {
                yeahCountElement.innerHTML = ++yeahcount + yeahCountElement.innerHTML.substr(yeahCountElement.innerHTML.indexOf(' '));
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
                wiiuBrowser.lockUserOperation(false);
            }
        }
        xhttp.send(params);
    }
}
function followCommunity() {
    var community = document.getElementsByClassName('community-page-follow-button-wrapper')[0];
    var followers = document.getElementsByClassName('community-page-follow-button-text')[0];
    var text = followers.innerText.substring(0, followers.innerText.indexOf(' '));
    var localText = followers.innerText.substring(followers.innerText.indexOf(' '));
    if (community.classList.contains("selected")) {
        community.classList.remove("selected");
        var params = "communityID=" + followers.id + "&type=false";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/communities/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(params);
        followers.innerHTML = --text + localText;
        wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
    }
    else {
        var params = "communityID=" + followers.id + "&type=true";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/communities/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                community.classList.add("selected");
                followers.innerHTML = ++text + localText;
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
            if (this.readyState === 4 && this.status === 423) {
                wiiuErrorViewer.openByCodeAndMessage(5980002, "An error has occurred.\n\nPlease try again later.\n\nIf the problem persists, please make a note of the error code and visit invite.gg/pretendo")
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
        }
        xhttp.send(params);
    }
}
function followUser(user) {
    var followersElement = document.getElementById('user-page-followers-tab');
    var followers = followersElement.innerHTML.trim().substr(0, followersElement.innerHTML.indexOf(' ') + 1);
    if (user.classList.contains("selected")) {
        user.classList.remove("selected");
        var params = "userID=" + user.id + "&type=false";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/users/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        xhttp.send(params);

        followersElement.innerText = --followers + followersElement.innerHTML.trim().substr(followersElement.innerHTML.indexOf(' '));
        wiiuSound.playSoundByName('SE_OLV_MII_CANCEL', 1);
    }
    else {
        user.classList.add("selected");

        var params = "userID=" + user.id + "&type=true";
        var xhttp = new XMLHttpRequest();
        xhttp.open("POST", '/users/follow', true);
        xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

        xhttp.onreadystatechange = function() {
            if (this.readyState === 4 && this.status === 200) {
                followersElement.innerText = ++followers + followersElement.innerHTML.trim().substr(followersElement.innerHTML.indexOf(' '));
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
            if (this.readyState === 4 && (this.status === 423 || this.status === 404)) {
                user.classList.remove("selected");
                wiiuSound.playSoundByName('SE_WAVE_MII_ADD', 1);
            }
        }
        xhttp.send(params);
    }
}

function scrollToBottom() {
    var scrollHeight = document.body.scrollHeight;
    var interval = setInterval(function () {
        if(document.body.scrollHeight !== scrollHeight) {
            window.scroll(0, document.body.scrollHeight);
            clearInterval(interval);
        }
    }, 100);
}
function createNewMessage(pid) {
    pjax.loadUrl('/messages/new/' + pid);
    wiiuBrowser.showLoadingIcon(!0)
    wiiuSound.playSoundByName('SE_OLV_OK', 1);
    scrollToBottom();
}
function showMessage(messageID) {
    pjax.loadUrl('/messages/' + messageID);
    wiiuBrowser.showLoadingIcon(!0);
    wiiuSound.playSoundByName('SE_OLV_OK', 1);
    scrollToBottom();
}
function sendMessage(conversationID, pid) {
    var today = new Date();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date +' '+time;
    var messageContents = document.getElementById("message-viewer-input").value;
    if(messageContents.length === 0)
        return;
    if(wiiuFilter.checkWord(messageContents) === -2) { messageContents.value = ''; alert('Message cannot contain explicit language.');}
    var currentThread = document.getElementById('message-viewer-content').innerHTML;
    var newMessage =
        '<div class="message-viewer-bubble-sent"><p class="message-viewer-bubble-sent-text">' + messageContents + '</p></div><div class="message-viewer-bubble-sent-timestamp"><p>' + dateTime + '</p></div>';
    var params = "conversationID=" + conversationID + "&message_to_pid=" + pid + "&body=" + messageContents;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", '/messages/new', true);
    xhr.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var scrollHeight = document.body.scrollHeight;
            document.getElementById("message-viewer-input").value = '';
            document.getElementById('message-viewer-content').innerHTML = currentThread + newMessage
            var interval = setInterval(function () {
                if(document.body.scrollHeight > scrollHeight) {
                    window.scroll(0, document.body.scrollHeight);
                    clearInterval(interval);
                }
            }, 100);
        }
        if (this.readyState === 4 && (this.status === 423 || this.status === 404)) {
            wiiuErrorViewer.openByCodeAndMessage(5986000 + this.status, 'Error: "' + this.statusText + '"\nPlease send the error code and what you were doing in');
        }
    }
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.send(params);

}
function sendPainting(conversationID, pid) {
    wiiuMemo.open(false);
    var drawing = wiiuMemo.getImage(false);
    var rawDrawing = wiiuMemo.getImage(true);
    if(drawing) {
        if(confirm("Send the Drawing?")) {
            var today = new Date();
            var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
            var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
            var dateTime = date +' '+time;
            var currentThread = document.getElementById('message-viewer-content').innerHTML;
            var newMessage =
                '\n<div class="message-viewer-bubble-sent">\n' +
                '            <img class="message-viewer-bubble-sent-memo" src="data:image/bmp;base64,' + drawing + '" >\n' +
                '        </div>\n' +
                '<div class="message-viewer-bubble-sent-timestamp"><p>' + dateTime + '</p></div>\n';
            var scrollHeight = document.body.scrollHeight;
            document.getElementById('message-viewer-content').innerHTML = currentThread + newMessage;
            wiiuMemo.reset();
            var params = "conversationID=" + conversationID + "&message_to_pid=" + pid + "&raw=" + rawDrawing + "&&drawing=" + drawing;
            var xhr = new XMLHttpRequest();
            xhr.open("POST", '/messages/new', true);
            xhr.onreadystatechange = function() {
                if (this.readyState === 4 && this.status === 200) {
                    document.getElementById("message-viewer-input").value = '';
                    document.getElementById('message-viewer-content').innerHTML = currentThread + newMessage
                    var interval = setInterval(function () {
                        if(document.body.scrollHeight > scrollHeight) {
                            window.scroll(0, document.body.scrollHeight);
                            clearInterval(interval);
                        }
                    }, 100);
                }
                if (this.readyState === 4 && (this.status === 423 || this.status === 404)) {
                    wiiuErrorViewer.openByCodeAndMessage(5986000 + this.status, 'Error: "' + this.statusText + '"\nPlease send the error code and what you were doing in');
                }
            }
            xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xhr.send(params);
        }
        else
            alert('Canceled');
    }
}
function storeScrollPosition() {
    scrollPosition = document.body.scrollTop;
}
function restoreLastScrollPosition() {
    window.scrollTo(0, scrollPosition);
}
function loadPosts(type) {
    wiiuBrowser.showLoadingIcon(true);
    document.getElementById('recent-tab').classList.remove('active');
    document.getElementById('popular-tab').classList.remove('active');
    document.getElementById('verified-tab').classList.remove('active');
    //0 recent : 1 popular : 2 verified
    switch (type) {
        case 0:
            document.getElementById("recent-tab").classList.add('active');
            type = 'new';
            break;
        case 1:
            document.getElementById("popular-tab").classList.add('active');
            type = 'popular';
            break;
        case 2:
            document.getElementById("verified-tab").classList.add('active');
            type = 'verified';
            break;
    }
    var id = document.getElementsByClassName('community-page-follow-button-text')[0].id
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById('wrapper').innerHTML = this.responseText;
            wiiuBrowser.showLoadingIcon(false);
            initCommunityUsers();
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('wrapper').innerHTML = '<p class="no-posts-text">No Posts</p>';
            wiiuBrowser.showLoadingIcon(false);
        }
        else if (this.readyState === 4){
            wiiuBrowser.showLoadingIcon(false);
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send the error code and what you were doing in');
        }
    };
    xhttp.open("GET", '/communities/' + id + '/' + type + '/loadposts', true);
    xhttp.send();

    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
    wiiuBrowser.showLoadingIcon(!1);

    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
}
function loadUserPosts(element, pid) {
    wiiuBrowser.showLoadingIcon(!0);
    var offset = Number(element.getAttribute('data-offset'));
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementsByClassName('community-page-post-box')[0].innerHTML += this.responseText;
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send the error code and what you were doing in');
        }
    };
    xhttp.open("GET", "/users/loadPosts" + '?offset=' + offset + '&pid=' + pid, true);
    xhttp.send();

    element.dataset.offset = offset + 10;
    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
    wiiuBrowser.showLoadingIcon(!1);
}
function loadCommunityPosts(element, typeCheck) {
    wiiuBrowser.showLoadingIcon(!0);
    var offset = Number(element.getAttribute('data-offset'));
    var id = document.getElementsByClassName('community-page-follow-button-text')[0].id
    var xhttp = new XMLHttpRequest();
    var type = 'new';
    if(!typeCheck) {
        if(document.getElementById('popular-tab').classList.contains('active'))
            type = 'popular';
        else if(document.getElementById('verified-tab').classList.contains('active'))
            type = 'verified';
    }
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementsByClassName('community-page-post-box')[0].innerHTML += this.responseText;
            initCommunityUsers();
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send the error code and what you were doing in');
        }
    };
    xhttp.open("GET", '/communities/' + id + '/' + type + '/loadposts?offset=' + offset, true);
    xhttp.send();

    element.dataset.offset = offset + 10;
    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
    wiiuBrowser.showLoadingIcon(!1);
}
function loadFeedPosts(element) {
    var offset = Number(element.getAttribute('data-offset'));
    wiiuBrowser.showLoadingIcon(!0);
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementById('wrapper').innerHTML += this.responseText;
        }
        else if(this.readyState === 4 && this.status === 204)
        {
            document.getElementById('load-more-posts-button').style.display = 'none';
        }
        else if (this.readyState === 4){
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send the error code and what you were doing in');
        }
    };
    xhttp.open("GET", '/activity-feed/loadposts?offset=' + offset, true);
    xhttp.send();

    element.dataset.offset = offset + 10;
    wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
    wiiuBrowser.showLoadingIcon(!1);
}
function switchUserPageTabs(type, id) {
    var typeDomain = '';
    document.getElementById('user-page-posts-tab').classList.remove('active');
    document.getElementById('user-page-friends-tab').classList.remove('active');
    document.getElementById('user-page-following-tab').classList.remove('active');
    document.getElementById('user-page-followers-tab').classList.remove('active');

    switch (type) {
        case 0:
            document.getElementById("user-page-posts-tab").classList.add('active');
            typeDomain = 'loadPosts';
            break;
        case 1:
            document.getElementById("user-page-friends-tab").classList.add('active');
            typeDomain = 'friends';
            break;
        case 2:
            document.getElementById("user-page-following-tab").classList.add('active');
            typeDomain = 'following';
            break;
        case 3:
            document.getElementById("user-page-followers-tab").classList.add('active');
            typeDomain = 'followers';
            break;

    }
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            document.getElementsByClassName('community-page-post-box')[0].innerHTML = this.responseText;
        }
        else if (this.readyState === 4){
            wiiuErrorViewer.openByCodeAndMessage(5983000 + this.status, 'Error: "' + this.statusText + '"\nPlease send the error code and what you were doing in #bug-reports');
        }
    };
    xhttp.open("GET", "/users/" + typeDomain + '?pid=' + id, true);
    xhttp.send();
    wiiuSound.playSoundByName("SE_OLV_OK", 1);
}
function swapPostType(type) {
    document.getElementsByClassName("post-type-button-text")[0].classList.remove('selected');
    document.getElementsByClassName("post-type-button-painting")[0].classList.remove('selected');

    switch (type) {
        case 0:
            document.getElementsByClassName("post-type-button-text")[0].classList.add('selected');
            document.getElementById('post-text-input').style.display = '';
            document.getElementById('post-painting-input').style.display = 'none';
            break;
        case 1:
            document.getElementsByClassName("post-type-button-painting")[0].classList.add('selected');
            document.getElementById('post-text-input').style.display = 'none';
            document.getElementById('post-painting-input').style.display = '';
            break;

    }
    wiiuSound.playSoundByName("SE_OLV_OK", 1);
}
function newPainting(reset) {
    wiiuMemo.open(reset);
    if(wiiuMemo.isFinish()) {
        document.getElementById('memo').src = 'data:image/png;base64,' + wiiuMemo.getImage(false);
        document.getElementById('memo').style.display = '';
        document.getElementById('memo-value').value = wiiuMemo.getImage(true);
    }
}
function loadScreenshots() {
    var dropdown = document.getElementsByClassName('post-screenshot-picker-dropdown')[0];
    if(dropdown.style.display === 'block')
        dropdown.style.display = 'none';
    else
        dropdown.style.display = 'block';
}
function selectScreenshot(select) {
    var screenshot;
    switch (select) {
        case 1:
            screenshot = wiiuMainApplication.getScreenShot(true);
            document.getElementById('screenshot-value').value = screenshot
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundImage = "url('data:image/png;base64," + screenshot + "')";
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundSize = '90%';
            break;
        case 2:
            screenshot = wiiuMainApplication.getScreenShot(false);
            document.getElementById('screenshot-value').value = screenshot;
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundImage = "url('data:image/png;base64," + screenshot + "')";
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundSize = '90%';
            break;
        default:
            document.getElementById('screenshot-value').value = '';
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundImage = '';
            document.getElementsByClassName('post-screenshot-picker-icon')[0].style.backgroundSize = '';
            break;
    }
}
function searchCommunities() {
    var input, filter, table, tr, td, i, j, txtValue;
    input = document.getElementById("search-bar");
    filter = input.value.toUpperCase();
    table = document.getElementById("community-list");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        for(j = 0; j < tr[i].getElementsByTagName("td").length; j++) {
            td = tr[i].getElementsByTagName("td")[j].children[0].children[1];
            if (td) {
                txtValue = td.textContent || td.innerText;
                if (txtValue.toUpperCase().indexOf(filter) > -1) {
                    tr[i].getElementsByTagName("td")[j].style.display = "";
                } else {
                    tr[i].getElementsByTagName("td")[j].style.display = "none";
                }
            }
        }
    }
}
function changeMiiImageReaction(element) {
    if(element.checked) {
        var pfp = document.getElementsByClassName('post-user-icon')[0];
        var newPfp;
        switch (element.value) {
            case '1':
                newPfp = 'smile_open_mouth.png'
                break;
            case '2':
                newPfp = 'wink_left.png'
                break;
            case '3':
                newPfp = 'surprise_open_mouth.png'
                break;
            case '4':
                newPfp = 'frustrated.png'
                break;
            case '5':
                newPfp = 'sorrow.png'
                break;
            default:
                newPfp = 'normal_face.png'
                break;
        }
        pfp.src = pfp.src.substring(0, pfp.src.lastIndexOf('/') + 1) + newPfp;
    }


}

checkForUpdates();
function checkForUpdates() {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function() {
        if (this.readyState === 4 && this.status === 200) {
            var notificationObj = JSON.parse(this.responseText);
            /**/
            if(notificationObj.message_count > 0  && notificationObj.message_count < 99) {
                document.getElementById("messages-badge").innerHTML = notificationObj.message_count;
                document.getElementById("messages-badge").style.display = "block";
            }
            else if(notificationObj.message_count >= 99) {
                document.getElementById("messages-badge").innerHTML = "99+";
                document.getElementById("messages-badge").style.display = "block";
            }
            else {
                document.getElementById("messages-badge").innerHTML = "";
                document.getElementById("messages-badge").style.display = "none";
            }
            /*Check for Notifications*/
            if(notificationObj.notification_count > 0  && notificationObj.notification_count < 99) {
                document.getElementById("news-badge").innerHTML = notificationObj.notification_count;
                document.getElementById("news-badge").style.display = "block";
            }
            else if(notificationObj.notification_count >= 99) {
                document.getElementById("news-badge").innerHTML = "99+";
                document.getElementById("news-badge").style.display = "block";
            }
            else {
                document.getElementById("news-badge").innerHTML = "";
                document.getElementById("news-badge").style.display = "none";
            }
        }
    };
    xhttp.open("GET", "/notifications.json", true);
    xhttp.send();
}
var bButtonCheck = setInterval(function() {
    wiiu.gamepad.update()
    if(wiiu.gamepad.hold === 16384 && wiiuBrowser.canHistoryBack()) {
        wiiuSound.playSoundByName("SE_WAVE_MENU", 1);
        window.history.back()
    }

}, 250);

//window.onscroll = function() {scrollFunction()};

function scrollFunction() {
    var scrollPrompt = document.getElementById("scroll-prompt");
    if (document.body.scrollTop > 450 || document.documentElement.scrollTop > 450) {
        scrollPrompt.style.display = "block";
    } else {
        scrollPrompt.style.display = "none";
    }
}

function topFunction() {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
}

/*Debugging*/
if (typeof wiiu === 'undefined') {
    window.wiiu = {
        gamepad: {
            update: function () {
                return true;
            },
            hold: 0
        }
    };
}
if (typeof wiiuSound === 'undefined') {
    window.wiiuSound = {
        playSound: function (soundId, device) {
            this.playSoundByName('id ' + soundId, device);
        },
        playSoundByName: function (name, device) {
            console.log('Play sound ' + name);
        }
    };
}
if( typeof wiiuFilter === 'undefined') {
    window.wiiuFilter = {
        checkWord: function(string) {
            return 0;
        }
    }
}
if (typeof wiiuBrowser === 'undefined') {
    window.wiiuBrowser = {
        closeApplication: function () {
            alert('application has closed');
        },
        showLoadingIcon: function (show) {
            console.log((show ? 'Show' : 'Hide') + ' loading icon');
        },
        endStartUp: function () {
            console.log('endStartUp');
        },
        lockUserOperation: function (lock) {
            console.log((lock ? 'Lock' : 'Unlock') + ' user operations');
        },
        lockHomeButtonMenu: function (lock) {
            console.log((lock ? 'Lock' : 'Unlock') + ' home button menu');
        },
        canHistoryBack: function () {
            return location.pathname !== '/';
        },
        setSwkbdDictionary: function (jsonString) {
            console.log('Set SWKBD dictionary', JSON.parse(jsonString));
            return (Math.random() < 0.5)
                ? {} : { error: { code: 111222, message: 'Test Error Message' } };
        },
        openTvAreaSetting: function () {
            alert('Opened the safety frame setting screen on the Tv side.');
        },
        jumpToBrowser: function (url) {
            console.log(url);
        },
        jumpToEshop: function (query) {
            console.log(query);
        },
        jumpToApplication: function(titleId, flags, communityId, appData, postId) {
            console.log(titleId);
        }
    };
}
if (typeof wiiuMemo === "undefined") {
    window.wiiuMemo = {
        _isFinish: true,
        open: function(reset) {
            console.log('wiiuMemo.open(reset = ' + reset + ')');
            this._isFinish = false;
            var self = this;
            setTimeout(function () { self._isFinish = true; }, 1000);
        },
        isFinish: function() {
            console.log('wiiuMemo.isFinish()');
            return this._isFinish;
        },
        reset: function () {
            console.log('wiiuMemo.reset()');
        },
        getImage: function (isTga) {
            console.log('wiiuMemo.getImage(isTga = ' + isTga + ')');
        }
    };
}
if (typeof wiiuBOSS === 'undefined') {
    window.wiiuBOSS = {
        isRegisteredBossTask: function () {
            console.log('wiiuBOSS.isRegisteredBossTask');
            var result = {
                "isRegistered" : true
            };
            return result;
        },
        registerBossTask: function (languageCode) {
            console.log('wiiuBOSS.registerBossTask');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
        unregisterBossTask: function () {
            console.log('wiiuBOSS.unregisterBossTask');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
        isRegisteredDirectMessageTask: function () {
            console.log('wiiuBOSS.isRegisteredDirectMessageTask');
            var result = {
                "isRegistered" : true
            };
            return result;
        },
        registerDirectMessageTask: function (languageCode) {
            console.log('wiiuBOSS.registerDirectMessageTask');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
        registerDirectMessageTaskEx: function (lifeTime, interval) {
            console.log('wiiuBOSS.registerDirectMessageTaskEx');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
        unregisterDirectMessageTask: function () {
            console.log('wiiuBOSS.unregisterDirectMessageTask');
            //return { "error" : { "code" : 1112222, "message" : "Test Error Message"} };
            return {};
        },
    };
}