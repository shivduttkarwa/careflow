<style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body { margin: 0; background: #f5f9fb; color: #14232a; font-family: Arial, Helvetica, sans-serif; font-size: 12px; line-height: 1.55; }
    .toolbar { position: sticky; top: 0; z-index: 5; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 14px 22px; background: #115e74; color: white; box-shadow: 0 5px 20px rgba(13,59,76,.16); }
    .toolbar strong { font-size: 13px; }
    .toolbar span { opacity: .75; font-size: 11px; }
    .toolbar button { border: 0; border-radius: 10px; background: white; color: #115e74; padding: 10px 16px; font-weight: 700; cursor: pointer; }
    .notice { max-width: 210mm; margin: 18px auto -4px; border: 1px solid #f5bacc; border-radius: 9px; background: #fdf0f5; padding: 11px 13px; }
    .page { width: 210mm; min-height: 297mm; margin: 22px auto; padding: 18mm; background: white; box-shadow: 0 12px 40px rgba(16,46,58,.12); }
    header { display: flex; justify-content: space-between; gap: 28px; padding-bottom: 18px; border-bottom: 2px solid #115e74; }
    .brand { color: #115e74; font-size: 11px; font-weight: 800; letter-spacing: .12em; text-transform: uppercase; }
    h1 { margin: 5px 0 0; font-size: 24px; letter-spacing: -.03em; }
    .meta { text-align: right; color: #5a747f; }
    .identity { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; padding: 17px 0; border-bottom: 1px solid #dbe6ea; }
    .label { color: #7d949d; font-size: 9px; font-weight: 800; letter-spacing: .07em; text-transform: uppercase; }
    .value { margin-top: 3px; font-weight: 600; }
    section { padding: 17px 0; border-bottom: 1px solid #eaf1f4; page-break-inside: avoid; }
    section:last-of-type { border-bottom: 0; }
    h2 { margin: 0 0 11px; color: #115e74; font-size: 14px; }
    .highlight h2 { display: inline-block; background: #fff1c2; padding: 3px 6px; border-radius: 4px; }
    dl { display: grid; grid-template-columns: 1fr 1fr; gap: 12px 24px; margin: 0; }
    dt { color: #7d949d; font-size: 9px; font-weight: 800; letter-spacing: .06em; text-transform: uppercase; }
    dd { margin: 2px 0 0; white-space: pre-wrap; }
    .follow-up { margin-top: 14px; border: 1px solid #f5bacc; border-radius: 9px; background: #fdf0f5; padding: 11px 13px; }
    footer { margin-top: 18px; display: flex; justify-content: space-between; color: #7d949d; font-size: 9px; }
    @page { size: A4; margin: 10mm; }
    @media print {
        body { background: white; }
        .toolbar { display: none; }
        .notice { max-width: none; margin: 0 0 8mm; }
        .page { width: auto; min-height: auto; margin: 0; padding: 7mm; box-shadow: none; }
        .page + .page { page-break-before: always; }
    }
</style>
