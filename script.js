document.addEventListener('DOMContentLoaded', function() {
  fetch('header.html')
    .then(response => response.text())
    .then(data => {
      document.getElementById('header-placeholder').innerHTML = data;
    });
});

// Header 추가 

document.getElementById('weight').addEventListener('input', function() {
  calculateDoses(this.value);
});

function calculateDoses(weight) {
  if (!weight) return; // ������ �Է��� ������ �Լ� ����
  
  // �� �๰�� ���� DD�� Con ���� DOM���� �������� �����ɴϴ�.
  const drugs = [
    { id: 'NorepiEpi', dd: parseFloat(document.getElementById('ddNorepiEpi').innerText), con: parseFloat(document.getElementById('conNorepiEpi').innerText) },
    { id: 'Dobutamine', dd: parseFloat(document.getElementById('ddDobutamine').innerText), con: parseFloat(document.getElementById('conDobutamine').innerText) },
    { id: 'Nitroglycerine', dd: parseFloat(document.getElementById('ddNitroglycerine').innerText), con: parseFloat(document.getElementById('conNitroglycerine').innerText) },
    { id: 'Phenylephrine', dd: parseFloat(document.getElementById('ddPhenylephrine').innerText), con: parseFloat(document.getElementById('conPhenylephrine').innerText) },
    { id: 'Dopamine', dd: parseFloat(document.getElementById('ddDopamine').innerText), con: parseFloat(document.getElementById('conDopamine').innerText) },
    { id: 'Vasopressin', dd: parseFloat(document.getElementById('ddVasopressin').innerText), con: parseFloat(document.getElementById('conVasopressin').innerText) }
  ];

  drugs.forEach(drug => {
    const result = calculateDrugDose(weight, drug.dd, drug.con, drug.id);
    document.getElementById(`result${drug.id}`).innerHTML = `<b>${result.toFixed(2)} cc/hr</b>`;
  });
}

function calculateDrugDose(weight, dd, con, drugId) {
  let result;
  const multiplier = (drugId === 'Dobutamine' || drugId === 'Nitroglycerine' || drugId === 'Dopamine') ? 0.001 : 1;
  if (drugId === 'Vasopressin') {
    result = dd * 60 / con;
  } else {
    result = (weight * dd * 60 * multiplier) / con;
  }
  return result;
}

function openEditModal(drugId) {
  document.getElementById('currentDrugId').value = drugId;
  document.getElementById('modalDD').value = document.getElementById(`dd${drugId}`).innerText;
  document.getElementById('modalCon').value = document.getElementById(`con${drugId}`).innerText;
  document.getElementById('editModal').style.display = 'block';
}

function closeModal() {
  document.getElementById('editModal').style.display = 'none';
}

function saveChanges() {
  const drugId = document.getElementById('currentDrugId').value;
  const newDD = document.getElementById('modalDD').value;
  const newCon = document.getElementById('modalCon').value;

  // DD�� Con ���� ������Ʈ
  document.getElementById(`dd${drugId}`).innerText = newDD;
  document.getElementById(`con${drugId}`).innerText = newCon;

  // ������Ʈ�� ������ �ٽ� ���
  calculateDoses(document.getElementById('weight').value);

  // ��� �ݱ�
  closeModal();
}
