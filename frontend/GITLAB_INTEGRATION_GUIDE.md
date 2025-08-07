# Οδηγός GitLab Integration

## Τι είναι το GitLab Integration;

Το GitLab Integration είναι ένα component που σου επιτρέπει να:
- Φέρνεις δεδομένα από το GitLab project σου
- Οργανώνεις τα issues ανά labels, assignees, και άλλα κριτήρια
- Δημιουργείς custom epics και milestones
- Αποθηκεύεις όλα τα δεδομένα στη βάση δεδομένων

## Πώς να το χρησιμοποιήσεις

### 1. Επιλογή Project
- Επίλεξε ένα project από το dropdown στο header
- Χωρίς επιλογή project, το component δεν θα λειτουργήσει

### 2. Φόρτωση Δεδομένων
- Πάτα το κουμπί **"Fetch GitLab Data"**
- Το σύστημα θα φέρει όλα τα issues και milestones από το GitLab
- Θα δεις μήνυμα επιτυχίας με τον αριθμό των issues και milestones

### 3. Εξερεύνηση Δεδομένων

#### Tab: Overview
- **Στατιστικά Project**: Συνολικό αριθμό issues, milestones, completion rate
- **Progress Bar**: Οπτική αναπαράσταση του completion rate

#### Tab: Issues by Labels
- **Οργανωμένα Issues**: Βλέπεις issues οργανωμένα ανά labels
- **Epic Candidates**: Κάθε label μπορεί να γίνει epic
- **Create Epic**: Κουμπί για δημιουργία custom epic

#### Tab: Issues by Assignee
- **Issues ανά Developer**: Βλέπεις πόσα issues έχει κάθε developer
- **Status**: Ανοιχτά vs κλειστά issues ανά developer

#### Tab: Milestones
- **GitLab Milestones**: Βλέπεις όλα τα milestones από το GitLab
- **Create Milestone**: Κουμπί για δημιουργία custom milestone

#### Tab: Create Structure
- **Create Epic**: Δημιουργία custom epic (6 μήνες διάρκεια)
- **Create Milestone**: Δημιουργία custom milestone (2 εβδομάδες διάρκεια)

### 4. Δημιουργία Custom Epic

1. Πάτα **"Create Epic"** από οποιοδήποτε tab
2. Συμπλήρωσε τη φόρμα:
   - **Title**: Τίτλος του epic (π.χ. "User Authentication System")
   - **Description**: Περιγραφή του epic
   - **Start Date**: Ημερομηνία έναρξης
   - **Due Date**: Ημερομηνία λήξης
   - **Select Issues**: Επίλεξε issues για να τα αντιστοιχίσεις στο epic
3. Πάτα **"Create Epic"**

### 5. Δημιουργία Custom Milestone

1. Πάτα **"Create Milestone"** από το milestones tab
2. Συμπλήρωσε τη φόρμα:
   - **Title**: Τίτλος του milestone (π.χ. "Sprint 1 - Authentication")
   - **Description**: Περιγραφή του milestone
   - **Start Date**: Ημερομηνία έναρξης
   - **Due Date**: Ημερομηνία λήξης
   - **Select Issues**: Επίλεξε issues για να τα αντιστοιχίσεις στο milestone
3. Πάτα **"Create Milestone"**

### 6. Αποθήκευση στη Βάση Δεδομένων

- Πάτα το κουμπί **"Save to Database"**
- Το σύστημα θα αποθηκεύσει όλα τα δεδομένα στη βάση
- Θα δεις μήνυμα επιτυχίας με σύνοψη των αποθηκευμένων δεδομένων

## Τι κάνει το κάθε Tab

### Overview
- Εμφανίζει στατιστικά του project
- Completion rate με progress bar
- Συνολικό αριθμό issues και milestones

### Issues by Labels
- Οργανώνει issues ανά GitLab labels
- Κάθε label μπορεί να γίνει epic
- Εμφανίζει assignee και status κάθε issue
- Priority badges (High, Medium, Low)

### Issues by Assignee
- Ομαδοποιεί issues ανά developer
- Εμφανίζει πόσα ανοιχτά/κλειστά issues έχει κάθε developer
- Χρήσιμο για capacity planning

### Milestones
- Εμφανίζει όλα τα GitLab milestones
- Start/Due dates
- Status (active/closed)
- Δυνατότητα δημιουργίας custom milestones

### Create Structure
- Interface για δημιουργία custom project structure
- Δημιουργία epics (6 μήνες)
- Δημιουργία milestones (2 εβδομάδες)
- Issue assignment functionality

## API Endpoints που χρησιμοποιεί

- `GET /api/analytics/projects/{project_id}/gitlab/full-data` - Φέρνει όλα τα δεδομένα
- `POST /api/analytics/projects/{project_id}/gitlab/save-to-database` - Αποθηκεύει στη βάση
- `POST /api/analytics/projects/{project_id}/epics` - Δημιουργεί epic
- `POST /api/analytics/projects/{project_id}/milestones` - Δημιουργεί milestone
- `GET /api/analytics/projects/{project_id}/available-issues` - Φέρνει διαθέσιμα issues

## Χρήσιμες Συμβουλές

1. **Πάντα επίλεξε project πρώτα** - Χωρίς project δεν λειτουργεί τίποτα
2. **Fetch data πρώτα** - Πάντα φόρτωσε τα δεδομένα πριν δημιουργήσεις epics/milestones
3. **Χρησιμοποίησε labels** - Τα GitLab labels είναι βάση για epics
4. **Save regularly** - Αποθήκευε τα δεδομένα συχνά στη βάση
5. **Check available issues** - Πάντα δες ποια issues είναι διαθέσιμα πριν τα αντιστοιχίσεις

## Troubleshooting

### Δεν φορτώνουν τα δεδομένα
- Έλεγξε ότι έχεις επιλέξει project
- Έλεγξε το GitLab token στο backend
- Έλεγξε τη σύνδεση με το GitLab API

### Δεν μπορείς να δημιουργήσεις epic/milestone
- Έλεγξε ότι έχεις φορτώσει τα δεδομένα πρώτα
- Έλεγξε ότι έχεις συμπληρώσει όλα τα υποχρεωτικά πεδία
- Έλεγξε ότι έχεις επιλέξει τουλάχιστον ένα issue

### Δεν αποθηκεύονται τα δεδομένα
- Έλεγξε τη σύνδεση με τη βάση δεδομένων
- Έλεγξε τα permissions του backend
- Έλεγξε τα logs για σφάλματα

## Επόμενα Βήματα

Μετά τη χρήση του GitLab Integration μπορείς να:
1. Χρησιμοποιήσεις τα analytics pages για reporting
2. Δεις velocity charts και team performance
3. Track progress των epics και milestones
4. Generate reports για stakeholders 