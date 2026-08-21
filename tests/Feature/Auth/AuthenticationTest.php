<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Database\Seeders\AccountSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\RateLimiter;
use Inertia\Testing\AssertableInertia as Assert;
use Laravel\Fortify\Features;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered()
    {
        $response = $this->get(route('login'));

        $response->assertOk();
    }

    public function test_the_login_screen_offers_every_seeded_demo_account()
    {
        config(['app.demo_logins' => true]);
        $this->seed(AccountSeeder::class);

        $this->get(route('login'))
            ->assertInertia(fn (Assert $page) => $page
                ->component('auth/login')
                ->has('demoAccounts', count(AccountSeeder::ACCOUNTS))
                ->where('demoAccounts.0.email', AccountSeeder::MANAGER_EMAIL)
                ->where('demoAccounts.0.role', 'manager')
                ->where('demoAccounts.0.password', AccountSeeder::DEMO_PASSWORD)
            );

        $this->post(route('login.store'), [
            'email' => AccountSeeder::MANAGER_EMAIL,
            'password' => AccountSeeder::DEMO_PASSWORD,
        ])->assertRedirect(route('dashboard', absolute: false));

        $this->assertAuthenticated();
    }

    public function test_demo_accounts_are_withheld_when_the_flag_is_off()
    {
        config(['app.demo_logins' => false]);
        $this->seed(AccountSeeder::class);

        $this->get(route('login'))
            ->assertInertia(fn (Assert $page) => $page->has('demoAccounts', 0));
    }

    public function test_users_can_authenticate_using_the_login_screen()
    {
        $user = User::factory()->create();

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('dashboard', absolute: false));
    }

    public function test_users_with_two_factor_enabled_are_redirected_to_two_factor_challenge()
    {
        $this->skipUnlessFortifyHas(Features::twoFactorAuthentication());

        Features::twoFactorAuthentication([
            'confirm' => true,
            'confirmPassword' => true,
        ]);

        $user = User::factory()->withTwoFactor()->create();

        $response = $this->post(route('login'), [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertRedirect(route('two-factor.login'));
        $response->assertSessionHas('login.id', $user->id);
        $this->assertGuest();
    }

    public function test_users_can_not_authenticate_with_invalid_password()
    {
        $user = User::factory()->create();

        $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_users_can_logout()
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post(route('logout'));

        $response->assertRedirect(route('home'));

        $this->assertGuest();
    }

    public function test_users_are_rate_limited()
    {
        $user = User::factory()->create();

        RateLimiter::increment(md5('login'.implode('|', [$user->email, '127.0.0.1'])), amount: 5);

        $response = $this->post(route('login.store'), [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertTooManyRequests();
    }
}
