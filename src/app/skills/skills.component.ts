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
    // this.addPlaceholderProjects();
    this.getProjects();
  }

  // TODO replace with real projects
  private addPlaceholderProjects(): void {
    const placeholderProject = new Project(
      '0',
      'PLACEHOLDER PROJECT',
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      'placeholder',
      'https://images.pexels.com/photos/270348/pexels-photo-270348.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
    );

    for (let i = 0; i < 4; i++) this.projects.push(placeholderProject);
  }

  private getProjects(): void {
    this.daoService.sendGetRequest('/projects').pipe(
      map((response: Project[]) => {return response})
    ).subscribe(res => this.projects = res);
  }
}
