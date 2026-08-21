<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Daily Care Record – {{ $report->patient->display_name }} – {{ $report->report_date->format('Y-m-d') }}</title>
    @include('reports.partials.styles')
</head>
<body>
    <div class="toolbar">
        <div><strong>PDF-ready care record</strong><br><span>Choose “Save as PDF” in the print destination.</span></div>
        <button type="button" onclick="window.print()">Print / Save PDF</button>
    </div>
    @include('reports.partials.record', ['report' => $report])
</body>
</html>
