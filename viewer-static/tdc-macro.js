Macro.add('DungeonCrawler', {
    tags     : null,
    handler  : function () {
        const mapName = this.args[0];
        const map = setup.tdc.maps[mapName];
        const tdc = window.dungeoncrawler;
        let x = this.args[1] ?? map.start.x;
        let y = this.args[2] ?? map.start.y;
        let facing = this.args[3] ?? map.start.direction;
        let size = this.args[4] ?? setup.tdc.viewportSize ?? '800px';

        // Create GameView
        const viewContainer = document.createElement('div');
        viewContainer.style.setProperty('--viewportSize', size);
        this.output.appendChild(viewContainer);
        const gameView = tdc.util.createView(viewContainer, map, x, y, facing);
        // Create GameControls
        const controlsContainer = document.createElement('div');
        this.output.appendChild(controlsContainer);
        const gameControls = tdc.util.createControls(controlsContainer, tdc.util.canMoveForwards(map, x, y, facing));

        let isActionBusy = false;
        gameView.$on('actionComplete', () => {
            isActionBusy = false;
        });
        // Bind GameControls to GameView and passage routing
        gameControls.$on('turnLeft', () => {
            if (isActionBusy) return;
            isActionBusy = true;
            facing = tdc.util.leftFrom(facing);
            gameView.facing = facing;
            gameControls.canMoveForwards = tdc.util.canMoveForwards(map, x, y, facing);
            variables().tdcFacing = facing;
        });

        gameControls.$on('goForwards', () => {
            if (isActionBusy || !tdc.util.canMoveForwards(map, x, y, facing)) {
                return;
            }
            isActionBusy = true;
            gameControls.$destroy();
            const move = tdc.util.goTowards(facing);
            gameView.x = x + move.x;
            gameView.y = y + move.y;

            gameView.$on('actionComplete', (action) => {
                if (action === 'go-forwards') {
                    gameView.$destroy();
                    Engine.play(`tdc-${mapName} (${x + move.x},${y + move.y})`);
                }
            })
        });

        gameControls.$on('turnRight', () => {
            if (isActionBusy) return;
            isActionBusy = true;
            facing = tdc.util.rightFrom(facing);
            gameView.facing = facing;
            gameControls.canMoveForwards = tdc.util.canMoveForwards(map, x, y, facing);
            variables().tdcFacing = facing;
        });
    },
});