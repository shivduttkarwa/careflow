<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('support_worker')->after('email');
        });

        Schema::create('homes', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('address')->nullable();
            $table->string('timezone')->default('Australia/Brisbane');
            $table->timestamps();
        });

        Schema::create('participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('home_id')->constrained()->restrictOnDelete();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('preferred_name')->nullable();
            $table->date('date_of_birth')->nullable();
            $table->string('status')->default('active');
            $table->text('support_summary')->nullable();
            $table->string('accent_colour', 20)->default('#115E74');
            $table->timestamps();
            $table->softDeletes();
            $table->index(['home_id', 'status']);
        });

        Schema::create('participant_user_assignments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('starts_on');
            $table->date('ends_on')->nullable();
            $table->timestamps();
            $table->unique(['participant_id', 'user_id', 'starts_on']);
            $table->index(['user_id', 'ends_on']);
        });

        Schema::create('shifts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained()->restrictOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->dateTime('starts_at');
            $table->dateTime('ends_at');
            $table->string('status')->default('scheduled');
            $table->timestamp('handover_read_at')->nullable();
            $table->timestamps();
            $table->index(['user_id', 'starts_at']);
            $table->index(['participant_id', 'starts_at']);
        });

        Schema::create('daily_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained()->restrictOnDelete();
            $table->foreignId('shift_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->date('report_date');
            $table->string('shift_type')->default('day');
            $table->string('status')->default('draft');

            $table->boolean('shower_taken')->nullable();
            $table->boolean('bed_bath')->nullable();
            $table->text('personal_care_notes')->nullable();
            $table->boolean('physio_completed')->nullable();

            $table->text('breakfast')->nullable();
            $table->text('lunch')->nullable();
            $table->text('dinner')->nullable();
            $table->text('snacks')->nullable();
            $table->unsignedInteger('fluids_ml')->nullable();
            $table->text('fluids_notes')->nullable();
            $table->text('food_notes')->nullable();

            $table->boolean('bowel_opened')->nullable();
            $table->string('bowel_texture')->nullable();
            $table->text('bowel_notes')->nullable();
            $table->string('urine_status')->nullable();
            $table->text('urine_notes')->nullable();

            $table->time('sleep_from')->nullable();
            $table->time('sleep_to')->nullable();
            $table->text('overnight_observations')->nullable();
            $table->text('overnight_attendance')->nullable();

            $table->boolean('follow_up_required')->default(false);
            $table->text('handover_notes')->nullable();
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();

            $table->index(['participant_id', 'report_date']);
            $table->index(['user_id', 'report_date']);
            $table->index(['status', 'report_date']);
        });

        Schema::create('seizure_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('participant_id')->constrained()->restrictOnDelete();
            $table->foreignId('daily_report_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('user_id')->constrained()->restrictOnDelete();
            $table->dateTime('occurred_at');
            $table->json('awareness')->nullable();
            $table->json('facial_expressions')->nullable();
            $table->json('body_movements')->nullable();
            $table->json('automatic_movements')->nullable();
            $table->json('speech')->nullable();
            $table->boolean('fell')->default(false);
            $table->text('fall_notes')->nullable();
            $table->json('after_effects')->nullable();
            $table->unsignedInteger('seizure_duration_seconds')->nullable();
            $table->unsignedInteger('recovery_duration_minutes')->nullable();
            $table->string('incontinence')->nullable();
            $table->boolean('injured')->default(false);
            $table->text('injury_notes')->nullable();
            $table->boolean('qas_called')->default(false);
            $table->boolean('incident_report_completed')->default(false);
            $table->string('observer_name');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamps();
            $table->index(['participant_id', 'occurred_at']);
        });

        Schema::create('announcements', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->text('body');
            $table->string('priority')->default('normal');
            $table->timestamp('published_at');
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();
        });

        Schema::create('announcement_user', function (Blueprint $table) {
            $table->id();
            $table->foreignId('announcement_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamp('read_at')->nullable();
            $table->timestamp('acknowledged_at')->nullable();
            $table->timestamps();
            $table->unique(['announcement_id', 'user_id']);
        });

        Schema::create('audit_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->nullableMorphs('auditable');
            $table->string('event');
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->index(['event', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('audit_events');
        Schema::dropIfExists('announcement_user');
        Schema::dropIfExists('announcements');
        Schema::dropIfExists('seizure_events');
        Schema::dropIfExists('daily_reports');
        Schema::dropIfExists('shifts');
        Schema::dropIfExists('participant_user_assignments');
        Schema::dropIfExists('participants');
        Schema::dropIfExists('homes');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });
    }
};
