document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  // By default, load the inbox
  load_mailbox('inbox');

  // Sent Button for E-Mail compose
  document.querySelector('#compose-form').onsubmit = async (event) => {
    
    // Stop form from Submitting
    event.preventDefault();
    
    try {
      // Get Form Data
      const recipients = document.querySelector('#compose-recipients').value;
      const subject = document.querySelector('#compose-subject').value;
      const body = document.querySelector('#compose-body').value;

    // API-Call
    const response = await fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients,
        subject,
        body
      })
    });

    // Json parsen
    const data = await response.json();

    // Check Http status if everything is okay. Else Error handling
    if (!response.ok) {
      throw new Error(data.error || "Unknown error while sending email.");
    }

    console.log("Email API response:", data);
    load_mailbox('sent');

    } catch (error) {
      console.error("Error sending email", error.message);
      showError(error.message);
    }
    

  }

});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

async function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
      const emailsView = document.querySelector('#emails-view');
      emailsView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

    try {
      // Api Call for the mails
      const response = await fetch(`/emails/${mailbox}`);

    // Json parsen
    const data = await response.json();

    // Check Http status if everything is okay. Else Error handling
    if (!response.ok) {
      throw new Error(data.error || "Unknown error while loading mailbox.");
    }
    console.log("Email API response:", data);



      data.forEach(email => {
      const element = document.createElement('div');
      element.className = 'container-xxl p-2 mt-1 border border-light-subtle rounded hover-lift';

      element.innerHTML = `
        <div class="row g-3 align-items-center ">
        <div class="col">
        <div class="sender">${email.sender}</div>
        <div class="subject">${email.subject}</div>
        </div>
        <div class="col">
        <div class="timestamp">${email.timestamp}</div></div>
        </div>
      `;
      emailsView.append(element);
    });


    } catch (error) {
      console.error("Error laoding mailbox", error.message);
    }   
  }


function showError(message) {
  const container = document.querySelector('#compose-error');

  // Delete old Error Message
  container.innerHTML = '';

  const element = document.createElement('div');
  element.className = 'alert alert-danger mt-3';
  element.innerText = message;

  container.append(element);
}
