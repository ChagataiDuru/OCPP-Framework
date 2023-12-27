import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

import { AuthService } from '../auth.service';

export interface RouteInfo {
    path: string;
    title: string;
    icon: string;
    class: string;
}

export const ROUTES: RouteInfo[] = [
    { path: '',               title: 'Dashboard',         icon:'nc-bank',       class: '' },
    { path: '/stations',      title: 'Charge Stations',   icon:'nc-diamond',    class: '' },
    { path: '/map',           title: 'Maps',              icon:'nc-pin-3',      class: '' },
    { path: '/transactions',  title: 'Transactions',     icon:'nc-bell-55',    class: '' },
];

@Component({
    moduleId: module.id,
    selector: 'sidebar-cmp',
    templateUrl: 'sidebar.component.html',
})
export class SidebarComponent implements OnInit {
    public menuItems: any[] | undefined;
    constructor(private authService: AuthService, private router: Router) {}
    ngOnInit() {
        this.menuItems = ROUTES.filter(menuItem => menuItem);
    }
    logout() {
        this.authService.logout();
        this.router.navigate(['/login']);
    }
}