const body = document.body;
const switch_mode = document.querySelector('#switch-mode i');
let mode = localStorage.getItem('darkmode');
console.log(mode);
if(mode =='true'){
    body.classList.add('dark');
    switch_mode.className ='bi bi-brightness-high-fill';
}
switch_mode.addEventListener('click', () =>{
    // alert('clicked!');
    let mode = body.classList.toggle('dark');
    switch_mode.classList.toggle('bi-moon-stars-fill');
    switch_mode.classList.toggle('bi-brightness-high-fill');
    //luu mode khi nguoi change (khi reload page thi ko mat)
    // console.log(mode);
    localStorage.setItem('darkmode',mode);
});