Macro.add('DungeonCrawler', {
    tags     : null,
    handler  : function () {
        const mapName = this.args[0];
        const map = setup.tdc.maps[mapName];
        const tdc = window.dungeoncrawler;
        let x = this.args[1] ?? map.start.x;
        let y = this.args[2] ?? map.start.y;
        let facing = this.args[3] ?? (map.start.facing || map.start.direction);
        let size = this.args[4] ?? setup.tdc.viewportSize ?? '800px';

        $(this.output).wiki('<<tdcTemplate>>');
        // Create event emitter for teardown
        const destroyEmitter = tdc.util.createEmitter();

        // Create GameView
        const viewContainer = this.output.querySelector('[data-tdc="gameview"]');
        viewContainer.style.setProperty('--viewportSize', size);
        const gameView = tdc.util.createView(viewContainer, map, x, y, facing);
        destroyEmitter.subscribe(() => gameView.$destroy());
        
        // If there is a minimap, bind it
        const emitter = tdc.util.createEmitter();
        const minimapContainer = this.output.querySelector('[data-tdc="minimap"]');
        let minimap;
        if (minimapContainer) {
            minimap = tdc.util.setupMinimap(variables, gameView, minimapContainer, emitter);
            destroyEmitter.subscribe(() => minimap.$destroy());
        }

        // These are the html-elements that control our game
        const btnTurnLeft = this.output.querySelector('[data-tdc="turn-left"]');
        const btnTurnRight = this.output.querySelector('[data-tdc="turn-right"]');
        const btnGoForwards = this.output.querySelector('[data-tdc="go-forwards"]');
        // bind the controls
        const unbind = tdc.util.setupControls(variables, (name) => Engine.play(name), gameView, { btnTurnLeft, btnTurnRight, btnGoForwards }, emitter);
        destroyEmitter.subscribe(() => unbind());

        // on enter next passage
        $(document).one(':passagestart', () => destroyEmitter.emit());
    },
});