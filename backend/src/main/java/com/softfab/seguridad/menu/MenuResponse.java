package com.softfab.seguridad.menu;

import java.util.List;

public record MenuResponse(String applicationName, String username, String fullName, String date, String time, List<MenuOptionDto> options) {}
