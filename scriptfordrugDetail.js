document.addEventListener('DOMContentLoaded', function () {
    // Load the header component dynamically if required
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        });

//--------------------------------------------------------//

    // Manage Floating Action Button (FAB) interactions
    const actionFab = document.querySelector('.actionFab');
    actionFab.addEventListener('click', function () {
        actionFab.classList.toggle('active');
    });

    // Manage modal operations for anesthesia data
    const modal = document.getElementById('anesthesiaModal');
    const close = document.querySelector('.modal .close');
    const showAnesthesiaModal = document.getElementById('show-anesthesia-modal');

    // Display the modal when the 'Add Anesthesia Data' button is clicked
    showAnesthesiaModal.addEventListener('click', function () {
        modal.style.display = 'block';
    });

    // Close the modal on 'x' click
    close.addEventListener('click', function () {
        modal.style.display = 'none';
    });

    // Close modal if clicked outside of it
    window.addEventListener('click', function (event) {
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Fetch and display drug details
    const urlParams = new URLSearchParams(window.location.search);
    const drugId = urlParams.get('id');
    fetchDrugDetails(drugId);
    fetchAnesthesiaInfo(drugId);

   });


function fetchDrugDetails(drugId) {
    fetch(`http://localhost:4000/drug/${drugId}`)
        .then(response => response.json())
        .then(drug => {
            const detailsContainer = document.getElementById('drugDetails');
            detailsContainer.innerHTML = `<h1>${drug.name}</h1>`;
            // Set drugId for use in other operations
            document.getElementById('drugId').value = drug.id;  // Assuming there's a hidden input field for drugId
        })
        .catch(error => console.error('Failed to fetch drug details:', error));
}


function fetchAnesthesiaInfo(drugId) {
    const infoContainer = document.getElementById('anesthesiaInfoContainer');
    fetch(`http://localhost:4000/drug/${drugId}/anesthesia`)
        .then(response => response.json())
        .then(anesthesiaInfos => {
            infoContainer.innerHTML = '';  // Clear existing content
            anesthesiaInfos.forEach(info => {
                const infoDiv = document.createElement('div');
                infoDiv.className = 'anesthesia-info';
                infoDiv.innerHTML = `
                    <p>Induction Inhalation: ${info.induction_inhalation}</p>
                    <p>Maintenance Inhalation: ${info.maintenance_inhalation}</p>
                    <p>Induction IV: ${info.induction_iv}</p>
                    <p>Maintenance IV: ${info.maintenance_iv}</p>
                    <p>Induction MAC: ${info.induction_mac}</p>
                    <p>Maintenance MAC: ${info.maintenance_mac}</p>
                    <p>Notes: ${info.free_text}</p>
                    <button onclick="editAnesthesiaInfo(${info.id})" class="edit-button">Edit</button>
                    <button onclick="deleteAnesthesiaInfo(${info.id})" class="delete-button">Delete</button>
                `;
                infoContainer.appendChild(infoDiv);
            });
        })
        .catch(error => console.error('Failed to fetch updated anesthesia details:', error));
}

document.addEventListener('DOMContentLoaded', function () {
    const anesthesiaForm = document.getElementById('anesthesiaForm');
    anesthesiaForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const formData = new FormData(this);
        const submitButton = this.querySelector("button[type='submit']");
        submitButton.disabled = true; // Disable the button to prevent multiple submissions

        submitAnesthesiaForm(formData)
            .then(() => {
                submitButton.disabled = false; // Re-enable the button after the operation
            })
            .catch(() => {
                submitButton.disabled = false; // Re-enable the button if there was an error
            });
    });
});
function submitAnesthesiaForm(formData) {
    const url = currentAnesthesiaId ? `http://localhost:4000/updateAnesthesia/${currentAnesthesiaId}` : 'http://localhost:4000/addAnesthesiaInfo';
    const method = currentAnesthesiaId ? 'PUT' : 'POST';

    return fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            drugId: document.getElementById('drugId').value, // Ensure this ID is fetched correctly
            inductionInhalation: formData.get('inductionInhalation'),
            maintenanceInhalation: formData.get('maintenanceInhalation'),
            inductionIV: formData.get('inductionIV'),
            maintenanceIV: formData.get('maintenanceIV'),
            inductionMAC: formData.get('inductionMAC'),
            maintenanceMAC: formData.get('maintenanceMAC'),
            freeText: formData.get('freeText')
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to process anesthesia information');
        }
        return response.json();
    })
    .then(data => {
        alert(currentAnesthesiaId ? 'Anesthesia info updated successfully' : 'Anesthesia info added successfully');
        document.getElementById('anesthesiaModal').style.display = 'none'; // Close the modal
        fetchAnesthesiaInfo(document.getElementById('drugId').value); // Refresh the list
        currentAnesthesiaId = null; // Reset the ID after operation
    })
    .catch(error => {
        console.error('Failed to process anesthesia info:', error);
        alert('Failed to process anesthesia information. Please try again.');
        throw error; // Re-throw the error to be caught by the caller
    });
}

// Global variable to track the current editing mode and ID
let currentAnesthesiaId = null;

function editAnesthesiaInfo(anesthesiaId) {
    currentAnesthesiaId = anesthesiaId; // Store the current anesthesia ID
    fetch(`http://localhost:4000/anesthesia/${anesthesiaId}`)
        .then(response => response.json())
        .then(data => {
            // Populate the form fields with existing data
            document.getElementById('inductionInhalation').value = data.induction_inhalation;
            document.getElementById('maintenanceInhalation').value = data.maintenance_inhalation;
            document.getElementById('inductionIV').value = data.induction_iv;
            document.getElementById('maintenanceIV').value = data.maintenance_iv;
            document.getElementById('inductionMAC').value = data.induction_mac;
            document.getElementById('maintenanceMAC').value = data.maintenance_mac;
            document.getElementById('freeText').value = data.free_text;
            // Show the modal
            document.getElementById('anesthesiaModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching anesthesia details:', error);
            alert('Error fetching information.');
        });
}

function deleteAnesthesiaInfo(anesthesiaId) {
    if (confirm('Are you sure you want to delete this anesthesia information?')) {
        fetch(`http://localhost:4000/deleteAnesthesia/${anesthesiaId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to delete anesthesia information');
                }
                return response.json();
            })
            .then(() => {
                alert('Anesthesia info deleted successfully');
                fetchAnesthesiaInfo(document.getElementById('drugId').value); // Refresh data after deletion
            })
            .catch(error => {
                console.error('Error deleting anesthesia info:', error);
                alert('Failed to delete anesthesia information. Please try again.');
            });
    }
}

//note modal에 관한 내용임//

document.addEventListener('DOMContentLoaded', function () {
    var noteModal = document.getElementById('noteModal');
    var btnOpenNoteModal = document.querySelector('li img[src="2.png"]').parentNode;
    var closeBtn = document.querySelectorAll('.close');

    btnOpenNoteModal.addEventListener('click', function () {
        noteModal.style.display = 'block';
    });

    closeBtn.forEach(function (btn) {
        btn.addEventListener('click', function () {
            this.closest('.modal').style.display = 'none';
        });
    });

    window.onclick = function (event) {
        if (event.target === noteModal) {
            noteModal.style.display = 'none';
        }
    };
    const urlParams = new URLSearchParams(window.location.search);
    const drugId = urlParams.get('id');
    fetchDrugNotes(drugId);  // Call this function to fetch and display notes
    console.log(drugId)
});


function submitDrugNote() {
    var noteContent = document.getElementById('drugNote')?.value.trim();  // Validate this input
    console.log(noteContent)

    if (!noteContent) {
        alert('Note content cannot be empty.');
        return;  // Stop execution if no note content
    }

    var drugId = document.getElementById('drugId').value;  // Ensure this is correctly fetched
    var apiUrl = currentNoteId ? `http://localhost:4000/updateNote/${currentNoteId}` : 'http://localhost:4000/addNote';
    var method = currentNoteId ? 'PUT' : 'POST';

    var noteData = {
        drugId: drugId,
        noteContent: noteContent
    };

    fetch(apiUrl, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(noteData)
    })
    .then(response => {
        if (!response.ok) throw new Error(`Failed to submit note: ${response.status} ${response.statusText}`);
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
            return response.json();
        } else {
            throw new Error('Expected JSON response but received: ' + contentType);
        }
    })
    .then(data => {
        console.log('Note processed successfully:', data);
        document.getElementById('drugNote').value = '';  // Clear the note textarea
        document.getElementById('noteModal').style.display = 'none';  // Close the modal
        fetchNotes(drugId);  // Refresh notes display if needed
        currentNoteId = null; // Reset the currentNoteId after submission
    })
    .catch(error => {
        console.error('Error submitting note:', error);
        alert(`Failed to submit note: ${error.message}`);
    });
    
}
  
function fetchDrugNotes(drugId) {
    fetch(`http://localhost:4000/drug/${drugId}/notes`)
        .then(response => response.json())
        .then(notes => {
            const notesContainer = document.getElementById('notesContainer');
            notesContainer.innerHTML = ''; // Clear existing notes
            notes.forEach(note => {
                const noteDiv = document.createElement('div');
                noteDiv.className = 'note-item';
                noteDiv.innerHTML = `
                    <p>${note.note}</p>
                    <button onclick="editNote(${note.id})" class="edit-button">Edit</button>
                    <button onclick="deleteNote(${note.id})" class="delete-button">Delete</button>
                `;
                notesContainer.appendChild(noteDiv);
            });
        })
        .catch(error => {
            console.error('Failed to fetch notes:', error);
            alert('Failed to load notes. Please try again.');
        });
}

var currentNoteId = null; // This will store the current editing note's ID

// Function to delete a note
function deleteNote(noteId) {
    if (confirm('Are you sure you want to delete this note?')) {
        fetch(`http://localhost:4000/deleteNote/${noteId}`, { method: 'DELETE' })
            .then(response => {
                if (!response.ok) throw new Error('Failed to delete the note');
                alert('Note deleted successfully');
                const urlParams = new URLSearchParams(window.location.search);
                const drugId = urlParams.get('id');
                fetchDrugNotes(drugId);  // Refresh the list of notes
            })
            .catch(error => {
                console.error('Error deleting note:', error);
                alert('Failed to delete the note. Please try again.');
            });
    }
}


function editNote(noteId) {
    fetch(`http://localhost:4000/note/${noteId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch note details');
            }
            return response.json();
        })
        .then(data => {
            currentNoteId = noteId; // Store the current note ID for update
            document.getElementById('drugNote').value = data.note;
            document.getElementById('noteModal').style.display = 'block';
        })
        .catch(error => {
            console.error('Error fetching note details:', error);
            alert('Error fetching information.');
        });
}

// Function to update a note
function updateNote(noteId) {
    const noteContent = document.getElementById('drugNote').value.trim();
    if (!noteContent) {
        alert('Note content cannot be empty.');
        return;
    }

    fetch(`http://localhost:4000/updateNote/${noteId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note: noteContent })
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to update the note');
            alert('Note updated successfully');
            document.getElementById('noteModal').style.display = 'none';
            const urlParams = new URLSearchParams(window.location.search);
            const drugId = urlParams.get('id');
            fetchDrugNotes(drugId);  // Refresh the list of notes
        })
        .catch(error => {
            console.error('Error updating note:', error);
            alert('Failed to update the note. Please try again.');
        });
}