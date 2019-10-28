const container = document.querySelector('.container');
const mouse = document.querySelector('#mouse');
const gear = document.querySelector('#gear');

gear.addEventListener('click', () => {
    window.ipc.send('open-settings');
});

window.ipc.on('error', (event, message) => {
    console.log(message);
    container.classList.add('error');
});

window.ipc.on('connected', () => {
    container.classList.remove('error');
});

window.ipc.on('action', (event, message) => {
    container.classList.add('active');
    setTimeout(() => {
        container.classList.remove('active');
    }, 200);
});