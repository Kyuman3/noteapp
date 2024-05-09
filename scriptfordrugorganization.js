document.addEventListener('DOMContentLoaded', function () {
    fetch('header.html')
        .then(response => response.text())
        .then(data => {
            document.getElementById('header-placeholder').innerHTML = data;
        });
});

// Header 추가 

// FAB 클릭 이벤트
document.getElementById('fab').addEventListener('click', function () {
    document.getElementById('inputModal').style.display = 'flex'; // 모달 표시
});

// 모달 닫기 기능
document.querySelector('.close').addEventListener('click', function () {
    document.getElementById('inputModal').style.display = 'none'; // 모달 숨기기
});


document.querySelectorAll('.close').forEach(closeButton => {
    closeButton.addEventListener('click', function () {
        this.closest('.modal').style.display = 'none';
    });
});

// 데이터베이스의 내용 가지고 오기. 
// Fetch and display drugs with Edit and Delete buttons
function fetchDrugs() {
    fetch('http://localhost:4000/drugs')
        .then(response => response.json())
        .then(data => {
            const container = document.getElementById('drugsContainer');
            container.innerHTML = ''; // Clear existing content
            data.forEach(drug => {
                const itemLink = document.createElement('a');
                itemLink.href = `drugDetail.html?id=${drug.id}`;
                itemLink.classList.add('drug-link');

                const newItem = document.createElement('div');
                newItem.classList.add('drug-item');
                newItem.textContent = `${drug.name}, ${drug.concentration} mg/ml`;

                const editButton = document.createElement('button');
                editButton.classList.add('drug-edit-button');
                editButton.textContent = 'Edit';
                editButton.onclick = function (event) {
                    event.preventDefault(); // Prevent navigating to the link
                    event.stopPropagation(); // Stop event from bubbling up
                    openEditModal(drug);
                };

                newItem.appendChild(editButton);
                itemLink.appendChild(newItem);
                container.appendChild(itemLink);

                // Adding condition to check if click target is not the edit button
                itemLink.addEventListener('click', function (event) {
                    if (event.target === itemLink) {
                        window.location.href = itemLink.href; // Only redirect if the link itself (not button) was clicked
                    }
                });
            });
        })
        .catch(error => console.error('Error fetching drugs:', error));
}

// Open edit modal with drug data
// Function to open the edit modal and populate it with existing drug data
function openEditModal(drug) {
    const editModal = document.getElementById('editModal');
    document.getElementById('editDrugName').value = drug.name;
    document.getElementById('editDrugConcentration').value = drug.concentration;

    // Store drug ID in a hidden attribute to be used for update and delete
    editModal.setAttribute('data-id', drug.id);

    editModal.style.display = 'flex'; // Show the edit modal
}
// Update drug information
function updateDrug() {
    const editModal = document.getElementById('editModal');
    const drugId = editModal.getAttribute('data-id');
    const updatedName = document.getElementById('editDrugName').value;
    const updatedConcentration = document.getElementById('editDrugConcentration').value;

    fetch(`http://localhost:4000/updateDrug/${drugId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: updatedName,
            concentration: updatedConcentration
        })
    })
    .then(response => response.json())
    .then(data => {
        alert('Drug updated successfully');
        editModal.style.display = 'none'; // Close the modal on success
        fetchDrugs(); // Refresh the list of drugs
    })
    .catch(error => {
        console.error('Error updating drug:', error);
        alert('Error updating drug.');
    });
}


document.addEventListener('DOMContentLoaded', function () {
    fetchDrugs(); // Call fetchDrugs when the document is ready
});

// 약물 추가 함수
function addDrug() {
    console.log("Script loaded!");

    const drugName = document.getElementById('drugName').value;
    const drugConcentration = document.getElementById('drugConcentration').value;
    console.log('Adding drug:', drugName, drugConcentration); // Log data being added
    if (drugName && drugConcentration) {
        fetch('http://localhost:4000/addDrug', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: drugName,
                concentration: drugConcentration
            })
        })
            .then(response => response.json())
            .then(data => {
                console.log('Data received:', data); // Log response data
                const container = document.getElementById('drugsContainer');
                console.log('Container:', container); // Verify container is found
                const newItem = document.createElement('div');
                newItem.classList.add('drug-item');
                newItem.textContent = `${drugName}, ${drugConcentration} mg/ml`;
                container.appendChild(newItem);
                console.log('New item added.');

                document.getElementById('inputModal').style.display = 'none'; // 약물 추가 후 모달 닫기
                document.getElementById('drugName').value = '';
                document.getElementById('drugConcentration').value = '';
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Error adding drug.');
            });
    } else {
        alert("약물 이름과 농도를 모두 입력해주세요.");
    }
}

// Delete a drug
function deleteDrug() {
    const editModal = document.getElementById('editModal');
    const drugId = editModal.getAttribute('data-id');

    fetch(`http://localhost:4000/deleteDrug/${drugId}`, {
        method: 'DELETE'
    })
    .then(response => response.json())
    .then(data => {
               editModal.style.display = 'none'; // Close the modal on success
        fetchDrugs(); // Refresh the list of drugs
    })
    .catch(error => {
        console.error('Error deleting drug:', error);
        alert('Error deleting drug.');
    });
}

// Close modal events
document.querySelectorAll('.close').forEach(closeButton => {
    closeButton.addEventListener('click', function () {
        this.closest('.modal').style.display = 'none';
    });
});
