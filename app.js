const express = require('express');
const cors = require('cors');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
app.use(cors());

const db = new sqlite3.Database('./myapp.db', sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
    if (err) {
        console.error('Error when connecting to the SQLite database', err.message);
        return;
    }
    console.log('Connected to the SQLite database.');
    db.exec('PRAGMA foreign_keys = ON;', err => {
        if (err) console.error("Pragma statement didn't execute properly", err.message);
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS drugs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            concentration TEXT NOT NULL
        )
    `, err => {
        if (err) console.error("Error creating 'drugs' table", err.message);
        else console.log("'drugs' table is ready.");
    });

    db.run(`
        CREATE TABLE IF NOT EXISTS anesthesia_info (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            drug_id INTEGER NOT NULL,
            induction_inhalation TEXT,
            maintenance_inhalation TEXT,
            induction_iv TEXT,
            maintenance_iv TEXT,
            induction_mac TEXT,
            maintenance_mac TEXT,
            free_text TEXT,
            FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE
        )
    `, err => {
        if (err) console.error("Error creating 'anesthesia_info' table", err.message);
        else console.log("'anesthesia_info' table is ready.");
    });

    // durgnote 추가 관련 //
    db.run(`CREATE TABLE IF NOT EXISTS drug_notes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    drug_id INTEGER NOT NULL,
    note TEXT NOT NULL,
    FOREIGN KEY (drug_id) REFERENCES drugs(id) ON DELETE CASCADE
)`, (err) => {
        if (err) {
            console.error("Error creating 'drug_notes' table", err.message);
            return;
        }
        console.log("'drug_notes' table is ready.");
    });

});


// POST endpoint to add a drug
app.post('/addDrug', (req, res) => {
    const { name, concentration } = req.body;
    const sql = `INSERT INTO drugs (name, concentration) VALUES (?,?)`;
    db.run(sql, [name, concentration], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error adding drug");
        } else {
            res.status(201).json({ id: this.lastID });
        }
    });
});


// GET endpoint to fetch all drugs
app.get('/drugs', (req, res) => {
    db.all(`SELECT * FROM drugs`, [], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Failed to retrieve drugs");
        } else {
            res.status(200).json(rows);
        }
    });
});

app.put('/updateDrug/:id', (req, res) => {
    const { name, concentration } = req.body;
    const { id } = req.params;
    db.run(`UPDATE drugs SET name = ?, concentration = ? WHERE id = ?`, [name, concentration, id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error updating drug");
        } else {
            res.status(200).json({ message: 'Drug updated successfully', id: this.lastID });
        }
    });
});

app.delete('/deleteDrug/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM drugs WHERE id = ?`, id, function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error deleting drug");
        } else {
            res.status(200).send('Drug deleted successfully');
        }
    });
});

app.get('/drug/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM drugs WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error(err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).json({ message: 'Drug not found' });
        }
    });
});


app.get('/drug/:id/anesthesia', (req, res) => {
    const { id } = req.params;
    db.all(`SELECT * FROM anesthesia_info WHERE drug_id = ?`, [id], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(500).send("Failed to retrieve anesthesia info");
        } else {
            res.status(200).json(rows);
        }
    });
});

// Endpoint to get a specific anesthesia record
app.get('/anesthesia/:id', (req, res) => {
    const id = req.params.id;
    const sql = `SELECT * FROM anesthesia_info WHERE id = ?`;
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error("Error fetching anesthesia detail:", err.message);
            res.status(400).json({ error: err.message });
            return;
        }
        if (row) {
            res.status(200).json(row);
        } else {
            res.status(404).send('Anesthesia information not found');
        }
    });
});



app.post('/addAnesthesiaInfo', (req, res) => {
    const {
        drugId,
        inductionInhalation,
        maintenanceInhalation,
        inductionIV,
        maintenanceIV,
        inductionMAC,
        maintenanceMAC,
        freeText
    } = req.body;

    const sql = `INSERT INTO anesthesia_info 
                 (drug_id, induction_inhalation, maintenance_inhalation, induction_iv, maintenance_iv, induction_mac, maintenance_mac, free_text)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

    db.run(sql, [drugId, inductionInhalation, maintenanceInhalation, inductionIV, maintenanceIV, inductionMAC, maintenanceMAC, freeText], function (err) {
        if (err) {
            console.error("Error inserting anesthesia information:", err.message);
            res.status(500).json({ error: err.message });
            return;
        }
        console.log("Inserted anesthesia info with ID:", this.lastID);
        res.status(201).json({ id: this.lastID });
    });
});


app.delete('/deleteAnesthesia/:id', (req, res) => {
    const { id } = req.params;
    db.run(`DELETE FROM anesthesia_info WHERE id = ?`, [id], function (err) {
        if (err) {
            console.error(err.message);
            res.status(500).send("Error deleting anesthesia info");
        } else {
            res.status(200).send('Anesthesia info deleted successfully');
        }
    });
});

// PUT endpoint to update anesthesia information
app.put('/updateAnesthesia/:id', (req, res) => {
    const { id } = req.params;
    const { inductionInhalation, maintenanceInhalation, inductionIV, maintenanceIV, inductionMAC, maintenanceMAC, freeText } = req.body;
    const sql = `UPDATE anesthesia_info SET induction_inhalation = ?, maintenance_inhalation = ?, induction_iv = ?, maintenance_iv = ?, induction_mac = ?, maintenance_mac = ?, free_text = ? WHERE id = ?`;

    db.run(sql, [inductionInhalation, maintenanceInhalation, inductionIV, maintenanceIV, inductionMAC, maintenanceMAC, freeText, id], function (err) {
        if (err) {
            console.error("Error updating anesthesia information:", err.message);
            return res.status(500).json({ error: "Error updating anesthesia information" });
        }
        res.status(200).json({ message: 'Anesthesia information updated successfully' });
    });
});


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

process.on('SIGINT', () => {
    db.close(err => {
        if (err) {
            console.error(err.message);
        } else {
            console.log('Database connection closed.');
        }
        process.exit(0);
    });
});


//drug note 관련 내용임//
// POST endpoint to add a note
app.post('/addNote', (req, res) => {
    const { drugId, noteContent } = req.body;
    console.log("Received for adding note:", req.body);  // Log incoming data
    if (!noteContent.trim()) {
        console.error("Validation Error: Note content cannot be empty");
        return res.status(400).json({ error: "Note content cannot be empty" });
    }
    const sql = `INSERT INTO drug_notes (drug_id, note) VALUES (?,?)`;
    db.run(sql, [drugId, noteContent], function(err) {
        if (err) {
            console.error("SQL Error inserting note into database:", err.message);
            return res.status(500).json({ error: "Error inserting note into the database: " + err.message });
        }
        console.log("Note added with ID:", this.lastID);  // Log the successful addition
        res.status(201).json({ id: this.lastID });
    });
});


// GET endpoint to fetch all notes for a specific drug
app.get('/drug/:id/notes', (req, res) => {
    const sql = `SELECT * FROM drug_notes WHERE drug_id = ?`;
    db.all(sql, [req.params.id], (err, rows) => {
        if (err) {
            console.error(err.message);
            res.status(400).json({ error: err.message });
            return;
        }
        res.status(200).json(rows);
    });
});

// Endpoint to get a specific note
app.get('/note/:id', (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM drug_notes WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            console.error("Error fetching note:", err.message);
            return res.status(500).json({ error: "Internal Server Error" });
        }
        if (!row) {
            return res.status(404).json({ message: "Note not found" });
        }
        res.status(200).json(row);
    });
});

// DELETE endpoint to remove a note
app.delete('/deleteNote/:id', (req, res) => {
    const sql = `DELETE FROM drug_notes WHERE id = ?`;
    db.run(sql, [req.params.id], function (err) {
        if (err) {
            res.status(500).json({ error: "Error deleting note", details: err.message });
            return;
        }
        res.json({ message: 'Note deleted successfully' });
    });
});

// PUT endpoint to update a note
app.put('/updateNote/:id', (req, res) => {
    const { note } = req.body;
    const { id } = req.params;
    const sql = `UPDATE drug_notes SET note = ? WHERE id = ?`;
    db.run(sql, [note, id], function (err) {
        if (err) {
            console.error("Error updating note:", err.message);
            res.status(500).json({ error: "Error updating note" });
            return;
        }
        res.status(200).json({ message: 'Note updated successfully' });
    });
});

