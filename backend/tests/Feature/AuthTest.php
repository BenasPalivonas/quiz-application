<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_user_can_register(): void
    {
        $response = $this->postJson('/api/register', [
            'name' => 'Jane Doe',
            'email' => 'jane@example.com',
            'password' => 'password123',
        ]);

        $response->assertCreated()
            ->assertJsonStructure(['user' => ['id', 'name', 'email'], 'token']);

        $this->assertDatabaseHas('users', ['email' => 'jane@example.com']);
    }

    public function test_a_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $response->assertOk()->assertJsonStructure(['user', 'token']);
    }

    public function test_login_fails_with_incorrect_password(): void
    {
        $user = User::factory()->create();

        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $response->assertUnprocessable();
    }

    public function test_guests_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/user')->assertUnauthorized();
    }
}
