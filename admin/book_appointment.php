<?php
include 'parts/mysql.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $ime = $_POST['ime'] ?? '';
    $prezime = $_POST['prezime'] ?? '';
    $broj_telefona = $_POST['broj_telefona'] ?? '';
    $date = $_POST['datum'] ?? '';
    $time = $_POST['vreme'] ?? '';
    $marka = $_POST['marka'] ?? '';

    if (!$ime || !$prezime || !$broj_telefona || !$date || !$time || !$marka) {
        echo json_encode(['error' => 'All fields are required.']);
        exit;
    }

    // Extract only the start time if `$time` includes a range
    $time = explode(' - ', $time)[0];
    $termin = "$date $time:00";

    // Check if the slot is already booked
    $stmt = $conn->prepare("SELECT COUNT(*) AS count FROM tehnicki_pregledi WHERE termin = ?");
    $stmt->bind_param('s', $termin);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();

    if ($result['count'] > 0) {
        echo json_encode(['error' => 'Nažalost, u medjuvremenu je termin rezervisan, izaberite drugi.']);
        exit;
    }

    // Insert new appointment
    $stmt = $conn->prepare("INSERT INTO tehnicki_pregledi (ime, prezime, marka, broj_telefona, termin, created_on) VALUES (?, ?, ?, ?, ?, NOW())");
    $stmt->bind_param('sssss', $ime, $prezime, $marka, $broj_telefona, $termin);
    
    if ($stmt->execute()) {
        // Format $termin to dd/mm/YYYY HH:mm:ss
        $dateTime = new DateTime($termin);
        $formattedDateTime = $dateTime->format('d/m/Y H:i:s');
        
        echo json_encode(['success' => "Uspešno zakazivanje termina. Očekujemo vas, datuma $formattedDateTime. Ukoliko želite da otkažete vaš termin, pozovite +381 65 220 0739."]);
    } else {
        echo json_encode(['error' => 'Greška prilikom zakazivanja termina.']);
    }
}
?>
