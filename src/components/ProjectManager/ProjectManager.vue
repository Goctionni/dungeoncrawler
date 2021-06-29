<template>
    <div class="container">
        <div class="overview">
            <div class="overview-title">Project Manager</div>
            <div class="overview-list">
                <p v-if="!projects.length">No saved projects</p>
                <template v-else>
                    <button
                        v-for="project in projects"
                        :key="`pm_project_${project.guid}`"
                        class="project"
                        :class="{ active: projectModel.toLowerCase() === project.name.toLowerCase() }"
                        v-text="project.name"
                        @click="projectModel = project.name"
                        @dblclick="projectName = project.name; openProject();"
                    />
                </template>
            </div>
            <div class="overview-input">
                <label>
                    Project name:
                    <input
                        v-model="projectModel"
                        placeholder="Enter project name"
                        @keydown.enter.prevent="isExistingProject ? openProject() : createNewProject()"
                    />
                </label>
            </div>
            <div class="overview-actions">
                <span v-if="!projectModel" class="message">Select a project or enter a name</span>
                <template v-else>
                    <button v-if="isExistingProject" @click="openProject()">Open project</button>
                    <button v-else @click="createNewProject()">Create new project</button>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

import { DEFAULT_TEXTURES } from '@/data/defaultTextures';
import { DEFAULT_MAP_FACTORY } from '@/data/defaultMap';
import { Facing, ProjectDefintion } from '@/types/Map.types';
import { ProjectListItem } from '@/types/store.types';
import { store } from '@/store';

@Component
export default class ProjectManager extends Vue {
  projects: ProjectListItem[] = [];
  projectModel = '';

  get isExistingProject(): boolean {
      const { projects, projectModel } = this;
      return projects.map((p) => p.name.toLowerCase()).includes(projectModel.toLowerCase());
  }

  createNewProject(): void {
    const project: ProjectDefintion = {
      guid: Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36),
      name: this.projectModel,
      textures: [...DEFAULT_TEXTURES],
      maps: [{
        ...DEFAULT_MAP_FACTORY(),
        name: 'map 1',
      }],
      hasUnsavedChanges: false,
    };
    this.$emit('setProject', project);
  }

  async openProject(): Promise<void> {
      const guid = this.projects.find((item) => item.name.toLowerCase() === this.projectModel.toLowerCase())?.guid;
      if (!guid) return alert('Error loading project!');
      const project = await store.getItem<ProjectDefintion>(`project__${guid}`);
      if (!project) return alert('Error loading project!');
      for (const map of project.maps) {
          const direction: Facing = (map.start as any)['direction']; // eslint-disable-line @typescript-eslint/no-explicit-any
          if (!map.start.facing && direction) {
              map.start.facing = direction;
          }
      }
      this.$emit('setProject', project);
  }

  async created(): Promise<void> {
      this.projects = await store.getItem<ProjectListItem[]>('project-list') || [];
  }
}
</script>

<style lang="scss" scoped>
.container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 10px;
    background-color: #999;
}

p {
    margin: 0;
}

.overview {
    background-color: #FFF;
    padding: 2px;
    display: flex;
    flex-direction: column;
    width: 400px;
    max-width: calc(100vw - 100px);
    gap: 2px;
    border-radius: 4px;

    &-title {
        padding: 5px;
        background-color: #369;
        color: #FFF;
        border-radius: 3px;
    }

    &-list {
        padding: 5px;
        font-size: 14px;
        min-height: 200px;
        border: solid #666 1px;
        border-radius: 3px;

        p {
            font-style: italic;
        }

        .project {
            display: block;
            border: 0;
            padding: .25em .5em;
            background: transparent;
            width: 100%;
            text-align: left;
            cursor: pointer;
            border-radius: 2px;

            &:hover {
                background-color: #DDD;
            }

            &.active {
                background-color: #48B;
                color: #FFF;
            }
        }
    }

    &-input {
        font-size: 12px;
        padding: 5px 0;

        label {
            display: flex;
            font-weight: bold;
            gap: 10px;
            padding-left: 10px;
            align-items: center;
        }

        input {
            flex: 1;
            border-radius: 3px;
            border: solid #666 1px;
            padding: 5px;
        }
    }

    &-actions {
        display: flex;
        justify-content: flex-end;
        padding-bottom: 5px;
        
        button {
            border: 0;
            border-radius: 3px;;
            background: #F2F2F2;
            padding: .5em 1em;
            cursor: pointer;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            transition: background-color .2s ease-in-out;
            min-height: 32px;

            &:hover {
                background: #DDD;
            }
        }

        .message {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            color: #999;
            font-size: 14px;
            font-style: italic;
            padding: 0 5px;
            min-height: 32px;
        }
    }
}
</style>