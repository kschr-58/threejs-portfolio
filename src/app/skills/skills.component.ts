import { Component } from '@angular/core';
import Project from 'src/models/project';
import DaoService from '../services/dao.service';
import { map } from 'rxjs';

@Component({
  selector: 'app-skills',
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  public projects: Project[] = [];

  constructor(private daoService: DaoService) {
    this.getProjects();
  }

  private getProjects(): void {
    this.daoService.sendGetRequest('/projects').pipe(
      map((response: Project[]) => {return response})
    ).subscribe(res => this.projects = res);
  }
}
