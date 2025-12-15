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
  document.querySelector('#mail-view').style.display = 'none';
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
  document.querySelector('#mail-view').style.display = 'none';

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

      
    // Creating for each email an div
    data.forEach(email => {
      const element = document.createElement('div');
      element.className = 'MailDiv rounded hover-lift';
      
      // Set to every div the id, so we can contact the specific div for each mail (Display none)
      element.id = "email-" + email.id
      
      // Change color of div either its read or unread
      if (email.read) {
        element.style= 'background-color: lightgray;';
      } else {
        element.style = 'background-color: white; border-style: solid; border-color: #0d6efd;';
      }   
        //Creating the html elements
        element.innerHTML = `
          <div class="SenderSubjectDiv">
            <div class="sender">${email.sender}</div>
            <div class="subject text-truncate">${email.subject}</div>
          </div>
          <div class="timeStampDiv">
            
              <div class="timestamp">${email.timestamp}</div>
              <div class="archiv-icon">

                <svg xmlns="http://www.w3.org/2000/svg" class="bi" viewBox="0 0 16 16" aria-hidden="true" id="archiv-icon" >
                  <path d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5l2.404.961L10.404 2l-2.218-.887zm3.564 1.426L5.596 5 8 5.961 14.154 3.5l-2.404-.961zm3.25 1.7-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"/>
                </svg>
              
            </div>
          </div>
        `;
        // Add event listener to open the mails
        element.addEventListener('click', () => {
        open_email(email.id)
      })
      // If the mailbox is sent, we dont need the archiv icon
      if (mailbox === "sent") {
        element.querySelector('#archiv-icon').style.display = 'none';
      }
      // Add the event listener for the archiv-icon
      const archiv_icon = element.querySelector('#archiv-icon');
      archiv_icon.addEventListener('click', (event) => {
        // This is important so the icon is also be clickable. Either way the click event to open an email triggers
        event.stopPropagation();
        toggle_archiv(email.id, email.archived);
      });

      emailsView.append(element);
    });


    } catch (error) {
      console.error("Error laoding mailbox", error.message);
    }   
  }

async function open_email(email_id) {
  
  // Show the correct view
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#mail-view').style.display = 'block';

  const mailView = document.querySelector('#mail-view');

  // clear the HTML of the last opend Mail. Either way the Text stacks
  mailView.innerHTML = '';

  try {
    // API call to get the data From an specific email
    const response = await fetch(`/emails/${email_id}`);
    const email = await response.json();

    if (!response.ok) {
      throw new Error(email.error || "Unknown error while loading mail");
    }

    console.log(email);
    // HTML element to display the email
    const element = document.createElement('div');
    element.innerHTML = `
      <div><span style="font-weight: bold;">From: </span> <span>${email.sender}</span></div>
      <div><span style="font-weight: bold;">To: </span> <span>${email.recipients}</span></div>
      <div><span style="font-weight: bold;">Subject : </span> <span>${email.subject}</span></div>
      <div><span style="font-weight: bold;">Timestamp : </span> <span>${email.timestamp}</span></div>
      <button class="btn btn-sm btn-outline-primary" id="reply">Reply</button>
      <hr>
      <div class="mail-body">${email.body}</div>
    `
    mailView.append(element);

    // Call function to set the email on read
    if (!email.read) {
      setRead(email.id)
    }
    
    // Add Clickevent to reply
    element.querySelector('#reply').addEventListener('click', () => reply(email));

  } catch (error) {
    console.error("Error loading mail", error.message);
  }
}

async function setRead(emailID) {

  // Set an email to read
  try {
      const response = await fetch(`/emails/${emailID}`, {
    method: 'PUT',
    body: JSON.stringify({
      read: true
    })
  })
  console.log("Email set to read")
  } catch(error) {
    console.error("Could not set Email to read");
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

async function toggle_archiv(email_id, archived) {

  try {

    const response = await fetch(`/emails/${email_id}`, {
      method: 'PUT',
      body: JSON.stringify({
        archived: !archived
      })
    })

    if (!response.ok) {
      throw new Error("Unknown error while archiving mail.");
    }

    
    const element = document.querySelector(`#email-${email_id}`);
    // remove icon seperate. Else the animation has a bug. It doenst shrink the container flawless if the icon is there
    element.querySelector('#archiv-icon').remove();

    element.style.animationPlayState = 'running';
    element.addEventListener('animationend', () => {
      element.remove();
    })

  } catch (error) {
    console.error("Error archiving Mail", error.message);

  }
}

function reply(email) {
  
  // open the compose view and fill the fields with the data from the email
  compose_email()

  const compose = document.querySelector('#compose-view');

  compose.querySelector('#compose-recipients').value = email.sender;
   
  const subject = email.subject
  const compose_subject = compose.querySelector('#compose-subject')

  // Add a Re:
  if (!subject.startsWith("Re:")) {
    compose_subject.value = "Re: " + subject;
  } else {
    compose_subject.value = subject;
  }

  compose.querySelector('#compose-body').value = `On ${email.timestamp} ${email.sender} wrote:\n\n${email.body}`



}