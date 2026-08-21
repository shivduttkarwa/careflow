<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Care book – {{ $range }}</title>
    @include('reports.partials.styles')
</head>
<body>
    <div class="toolbar">
        <div><strong>Care book · {{ $reports->count() }} {{ Str::plural('record', $reports->count()) }}</strong><br><span>{{ $range }} · choose “Save as PDF” in the print destination.</span></div>
        <button type="button" onclick="window.print()">Print / Save PDF</button>
    </div>

    @if($truncated)
        <div class="notice"><strong>Showing the first {{ $reports->count() }} records of {{ $total }}.</strong><br>Narrow the date range or filter by patient to include the rest.</div>
    @endif

    @forelse($reports as $report)
        @include('reports.partials.record', ['report' => $report])
    @empty
        <article class="page">
            <header><div><div class="brand">CareFlow · Secure care record</div><h1>Care book</h1></div></header>
            <section><p>No care records match the selected filters.</p></section>
        </article>
    @endforelse
</body>
</html>
