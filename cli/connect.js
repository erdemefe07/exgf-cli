var socket = io();

socket.on('refresh', () => {
  window.location.reload()
})