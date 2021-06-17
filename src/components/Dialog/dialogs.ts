import Vue from 'vue'
import Alert from './Alert.vue'
import Confirm from './Confirm.vue'
import Prompt from './Prompt.vue'

Vue.config.productionTip = false;

const alert = (title: string, message: string): Promise<void> => {
    const oldSelection = document.activeElement as HTMLElement | null;
    oldSelection?.blur();

    return new Promise<void>((resolve) => {
        const container = document.createElement('div');
        const mnt = document.createElement('div');
        container.appendChild(mnt);
        document.body.appendChild(container);

        const instance = new Alert({ propsData: {
            title,
            message,
        }}).$mount(mnt);

        instance.$on('btn', () => {
            instance.$destroy();
            instance.$el.remove();
            resolve();
            oldSelection?.focus();
        });
    });
};

const confirm = (title: string, message: string, buttons: string[] = ['Cancel', '!Ok']): Promise<string> => {
    const oldSelection = document.activeElement as HTMLElement | null;
    oldSelection?.blur();

    return new Promise<string>((resolve) => {
        const container = document.createElement('div');
        const mnt = document.createElement('div');
        container.appendChild(mnt);
        document.body.appendChild(container);

        const instance = new Confirm({ propsData: {
            title,
            message,
            buttons,
        }}).$mount(mnt);

        instance.$on('btn', (text: string) => {
            instance.$destroy();
            instance.$el.remove();
            resolve(text);
            oldSelection?.focus();
        });
    });
};

const prompt = (title: string, message: string, initialValue: string): Promise<string | false> => {
    const oldSelection = document.activeElement as HTMLElement | null;
    oldSelection?.blur();

    return new Promise<string | false>((resolve) => {
        const container = document.createElement('div');
        const mnt = document.createElement('div');
        container.appendChild(mnt);
        document.body.appendChild(container);

        const instance = new Prompt({ propsData: {
            title,
            message,
            initialValue,
        }}).$mount(mnt);

        instance.$on('btn', (text: string | false) => {
            instance.$destroy();
            instance.$el.remove();
            resolve(text);
            oldSelection?.focus();
        });
    });
};

export const Dialogs = { alert, confirm, prompt };