<template>
    <div class="container">
        <div class="overview">
            <div class="overview-title">Project Manager</div>
            <div class="overview-list">
                <p v-if="!projects.length">No saved projects</p>
                <template v-else>
                    <div
                        v-for="project in projects"
                        :key="`pm_project_${project}`"
                        class="project"
                        :class="{ active: projectModel.toLowerCase() === project.toLowerCase() }"
                    >
                        {{ project }}
                    </div>
                </template>
            </div>
            <div class="overview-input">
                <label>
                    Project name:
                    <input v-model="projectModel" placeholder="Enter project name">
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
import { ProjectDefintion } from '@/types/Map.types';
import { store } from '@/store';

@Component
export default class ProjectManager extends Vue {
  projects: string[] = [];
  projectModel = '';

  get isExistingProject(): boolean {
      const { projects, projectModel } = this;
      return projects.map((p) => p.toLowerCase()).includes(projectModel.toLowerCase());
  }

  createNewProject(name: string): void {
    this.$emit('setProject', {
      name,
      textures: DEFAULT_TEXTURES,
      maps: [{
        name: 'map 1',
        size: { x: 7, y: 7 },
        start: { x: 3, y: 3, direction: 'north' },
        tiles: {},
      }],
    });
  }

  async openProject(): Promise<void> {
      const project = await store.getItem<ProjectDefintion>(`project__${this.projectModel}`);
      if (!project) return alert('Error loading project!');
      this.$emit('setProject', project);
  }

  async created(): Promise<void> {
      this.projects = await store.getItem<string[]>('project-list') || [];
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

            &:hover {
                background: #DDD;
            }
        }

        .message {
            color: #999;
            font-size: 14px;
            font-style: italic;
            padding: 0 5px;
        }
    }
}
</style>