<?php
include 'parts/mysql.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    $date = $_GET['date'] ?? '';

    // Validate date input
    if (!$date || !strtotime($date) || date('w', strtotime($date)) == 0 || strtotime($date) < strtotime(date('Y-m-d'))) {
        echo json_encode(['error' => 'Invalid date selected.']);
        exit;
    }

    // Define working periods excluding breaks
    $workingPeriods = [];

    // Adjust for Saturday
    if (date('w', strtotime($date)) == 6) { // Saturday
        $workingPeriods[] = ['start' => '08:00', 'end' => '11:00'];
        $workingPeriods[] = ['start' => '11:30', 'end' => '14:00'];
    } else { // Weekdays
        $workingPeriods[] = ['start' => '08:00', 'end' => '11:00'];
        $workingPeriods[] = ['start' => '11:30', 'end' => '17:30'];
        $workingPeriods[] = ['start' => '18:00', 'end' => '20:00'];
    }

    $slots = [];
    foreach ($workingPeriods as $period) {
        $startTime = new DateTime($date . ' ' . $period['start']);
        $endTime = new DateTime($date . ' ' . $period['end']);

        while ($startTime < $endTime) {
            // Clone the start time to create the end time for the slot
            $slotEndTime = clone $startTime;
            $slotEndTime->modify('+45 minutes');

            // If slot end time exceeds period end time, adjust it
            if ($slotEndTime > $endTime) {
                $slotEndTime = clone $endTime;
            }

            // Format the slot as "start - end" (e.g., "08:00 - 08:45")
            $slots[] = $startTime->format('H:i') . ' - ' . $slotEndTime->format('H:i');

            // Move to the next slot
            $startTime = clone $slotEndTime;
        }
    }

    // Fetch booked slots for the selected date
    $stmt = $conn->prepare("SELECT termin FROM tehnicki_pregledi WHERE DATE(termin) = ?");
    $stmt->bind_param('s', $date);
    $stmt->execute();
    $result = $stmt->get_result();
    $bookedSlots = [];

    while ($row = $result->fetch_assoc()) {
        // Convert booked times to the same format as in the available slots list
        $bookedStartTime = new DateTime($row['termin']);
        $bookedEndTime = clone $bookedStartTime;
        $bookedEndTime->modify('+45 minutes');
        $bookedSlots[] = $bookedStartTime->format('H:i') . ' - ' . $bookedEndTime->format('H:i');
    }

    // Calculate available slots by removing booked slots
    $availableSlots = array_diff($slots, $bookedSlots);

    echo json_encode(['slots' => array_values($availableSlots)]);
}
?>
