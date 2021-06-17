import _ from 'lodash';
import * as $ from 'jquery';
import { io, Socket } from "socket.io-client"

/***
 * Messages handle
 */

//  Sending messages
function sendMessage() {
  const name_changer = document.getElementById("inputElementName");
  const message_changer = document.getElementById("inputElementMessage");

  let msg = { name: name_changer.value, message: message_changer.value };
  msg.message = msg.message.trim();
  msg.message = msg.message.slice(0, 1000);
  msg.name = msg.name.trim();
  msg.name = msg.name.slice(0, 20);

  if (msg.name && msg.message) {
    socket.emit('message', JSON.stringify(msg));
    message_changer.value = "";
  }
}

//  Getting messages
function messagePlace(message) {
  const message_display = $("#panelMessagesDiaplay");

  let message_element = document.createElement("div");
  let message_author_element = document.createElement("p");
  let message_data = document.createElement("a");

  message_author_element.innerText = message.name;
  message_author_element.classList.add("author");
  message_data.innerText = message.message;
  message_data.classList.add("data");

  message_element.classList.add("messageBox");
  message_element.appendChild(message_author_element);
  message_element.appendChild(message_data);
  message_display.appendChild(message_element);
  message_display.scrollTop = message_display.scrollHeight;
}

//  Button showing
function buttonShowing() {
  const send_but = document.getElementById("inputElementSendMessage");
  const label = document.getElementById("labelSendMessage");
  const message_changer = document.getElementById("inputElementMessage");
  const name_changer = document.getElementById("inputElementName");

  if (message_changer.value && name_changer.value) {
    send_but.style.display = "inline-block";
    label.style.display = "inline-block";
  } else {
    send_but.style.display = "none";
    label.style.display = "none";
  }

  if (message_changer.value) {
    message_changer.style.height = "15vh";
  } else {
    message_changer.style.height = "2.5vh";
  }
}

/***
 * Cookies handle
 */

// Getting value by key from cookie
function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}

// Filling name field from cookie
function setNameCookie() {
  const name_changer = document.getElementById("inputElementName");
  document.cookie = `name=${name_changer.value}`;
}

// Geting name from cookie
function loadNameCookie() {
  const name_changer = document.getElementById("inputElementName");
  let name_fromm_cookie = getCookie('name');

  if (name_fromm_cookie) name_changer.value = name_fromm_cookie;
}

/***
 * Event handle
 */

// Body onload
function onLoad() {
  // Message sending
  $('body').append('<div id="panelMessageSending"></div>');

  // Message sending title
  $('#panelMessageSending').append('<p id="titleMessgeSending" class="title">Message<br>sending</p>');

  // Message sending author
  $('#panelMessageSending').append('<input id="inputElementName" class="text textInput" type="title">');
  $('#inputElementName').placeholder = "name";
  $('#inputElementName').on('input', () => buttonShowing());
  $('#inputElementName').on('change', () => setNameCookie());

  // Message sending data
  $('#panelMessageSending').append('<textarea id="inputElementMessage" class="text textInput"></textarea>');
  $('#inputElementMessage').placeholder = "message";
  $('#inputElementMessage').on('click', (event) => {
    if (event.key === 13 && !event.shiftKey) {
      sendMessage();
      buttonShowing();
    }
  });

  // Message sending submit button
  $('#panelMessageSending').append('<input id="inputElementSendMessage" class="title button" type="button"></input>')
  $('#inputElementSendMessage').style.display = "none";
  $('#inputElementSendMessage').value = "&#10149;";
  $('#inputElementSendMessage').on('click', () => {
    sendMessage();
    buttonShowing();
  });

  // Message sending submit label
  $('#panelMessageSending').append('<label id="labelSendMessage" class="text">SEND</label>')
  $('#labelSendMessage').style.display = "none";

  // Messages displayng
  $('#body').append('<div id="panelMessagesDiaplay"></div>');
  $('#panelMessagesDiaplay').append('<p id="titleMessagesDiaplay" class="title">Messages</p>');

  // socket initialisation
  var socket = io();
  socket.on('message', (msg) => {
    console.log(msg);
    messagePlace(JSON.parse(msg));
  });

  // loading name from cookie
  loadNameCookie();
}

$(onLoad)