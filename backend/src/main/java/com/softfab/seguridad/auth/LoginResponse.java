package com.softfab.seguridad.auth;

public record LoginResponse(String token, String username, String fullName, String roles) {}
