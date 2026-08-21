<?php

namespace App\Http\Controllers;

use App\Models\Announcement;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class AnnouncementController extends Controller
{
    public function acknowledge(Request $request, Announcement $announcement): RedirectResponse
    {
        $announcement->users()->syncWithoutDetaching([
            $request->user()->id => [
                'read_at' => now(),
                'acknowledged_at' => now(),
            ],
        ]);

        return back()->with('success', 'Notice acknowledged.');
    }
}
