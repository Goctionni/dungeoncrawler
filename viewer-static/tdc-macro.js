Macro.add('DungeonCrawler', {
    tags     : null,
    handler  : function () {
        let [mapName, x, y, facing, size] = this.args;
        const map = setup.tdc.maps[mapName];
        const tdc = window.dungeoncrawler;

        // Create GameView
        const viewContainer = document.createElement('div');
        viewContainer.style.setProperty('--viewportSize', size || '800px');
        this.output.appendChild(viewContainer);
        const gameView = tdc.util.createView(viewContainer, map, x, y, facing);
        // Create GameControls
        const controlsContainer = document.createElement('div');
        this.output.appendChild(controlsContainer);
        const gameControls = tdc.util.createControls(controlsContainer, tdc.util.canMoveForwards(map, x, y, facing));

        // Bind GameControls to GameView and passage routing
        gameControls.$on('turnLeft', () => {
            facing = tdc.util.leftFrom(facing);
            gameView.facing = facing;
            gameControls.canMoveForwards = tdc.util.canMoveForwards(map, x, y, facing);
            variables().tdcFacing = facing;
        });

        gameControls.$on('goForwards', () => {
            gameControls.$destroy();
            const move = tdc.util.goTowards(facing);
            gameView.x = x + move.x;
            gameView.y = y + move.y;

            gameView.$on('actionComplete', (action) => {
                if (action === 'go-forwards') {
                    gameView.$destroy();
                    Engine.play(`tdc-${mapName}-${x + move.x},${y + move.y}`);
                }
            })
        });

        gameControls.$on('turnRight', () => {
            facing = tdc.util.rightFrom(facing);
            gameView.facing = facing;
            gameControls.canMoveForwards = tdc.util.canMoveForwards(map, x, y, facing);
            variables().tdcFacing = facing;
        });
    },
});