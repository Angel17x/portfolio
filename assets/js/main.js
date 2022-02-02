document.addEventListener("DOMContentLoaded", () => {
  let buttons = document.querySelectorAll('a');
  let sections = document.querySelectorAll('section');
  
  window.addEventListener('scroll', function(){
      sections.forEach((el) => {
          let rect = el.getBoundingClientRect().top + window.scrollY;
          if(this.window.scrollY >= (rect/3)){
              //let target = el.id
              document.querySelectorAll('a').forEach(e => {
                  if(e.getAttribute('href') === "#"+el.id){
                      e.classList.add('active');
                  }
                  if(e.getAttribute('href') != "#"+el.id){
                      e.classList.remove('active');
                  }
                  
              })
          }
      }) 
  })
  sections.forEach((el) => {
    let rect = el.getBoundingClientRect().top + window.scrollY;
    if(this.window.scrollY >= (rect/3)){
        //let target = el.id
        document.querySelectorAll('a').forEach(e => {
            if(e.getAttribute('href') === "#"+el.id){
                e.classList.add('active');
            }
            if(e.getAttribute('href') != "#"+el.id){
                e.classList.remove('active');
            }
            
        })
    }
}) 

  buttons.forEach((button,i) => {
    
      button.addEventListener('click', (e) => {
          e.preventDefault();
          if (document.querySelector('a.active') !== null) {
              document.querySelector('a.active').classList.remove('active');
            }
          e.currentTarget.classList.add('active');
          let target = e.currentTarget.getAttribute('href');
        document.querySelector(target).scrollIntoView({
          behavior: 'smooth'
        });
      });
    });
})
