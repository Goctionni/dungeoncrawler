import Vue from 'vue'
import Alert from './Alert.vue'
import Confirm from './Confirm.vue'
import Prompt from './Prompt.vue'

Vue.config.productionTip = false;

const alert = (title: string, message: string): Promise<void> => {
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
            resolve()
        });
    });
};

const confirm = (title: string, message: string, buttons: string[] = ['Cancel', '!Ok']): Promise<string> => {
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
        });
    });
};

const prompt = (title: string, message: string, initialValue: string): Promise<string | false> => {
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
        });
    });
};

export const Dialogs = { alert, confirm, prompt };