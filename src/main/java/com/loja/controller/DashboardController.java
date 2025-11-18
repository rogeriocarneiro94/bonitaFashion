package com.loja.controller;

import com.loja.dto.DashboardDTO;
import com.loja.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping
    @PreAuthorize("hasAnyRole('GERENTE', 'VENDEDOR')")
    public DashboardDTO getStats() {
        return dashboardService.getDashboardStats();
    }
}