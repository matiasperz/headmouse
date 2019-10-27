const container = document.querySelector('.container');
const mouse = document.querySelector('#mouse');
const gear = document.querySelector('#gear');

gear.addEventListener('click', () => {
    window.ipc.send('open-settings');
});