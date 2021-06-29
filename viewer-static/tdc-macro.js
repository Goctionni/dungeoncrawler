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

        // Create GameView
        const viewContainer = this.output.querySelector('[data-tdc="gameview"]');
        viewContainer.style.setProperty('--viewportSize', size);
        const gameView = tdc.util.createView(viewContainer, map, x, y, facing);
        
        // If there is a minimap, bind it
        let changeListener;
        const minimapContainer = this.output.querySelector('[data-tdc="minimap"]');
        if (minimapContainer) {
            let player = { x: gameView.x, y: gameView.y, facing: gameView.facing || facing };
            let knownFaces = variables().tdcMinimapKnownFaces || [];
            try { knownFaces = tdc.util.addToKnownFaces(player, map, knownFaces); }
            catch(e) { console.error(e) };
            const minimap = tdc.util.createMinimap(minimapContainer, knownFaces, player);
            changeListener = () => {
                player = { x: gameView.x, y: gameView.y, facing: gameView.facing || facing };
                minimap.player = player;
                // (player: FacingPos, map: MapDefinition, knownFaces: FacePos[]): FacePos[]
                knownFaces = tdc.util.addToKnownFaces(player, map, knownFaces);
                variables().tdcMinimapKnownFaces = knownFaces;
                minimap.faces = knownFaces;
            }
        }

        // These are the html-elements that control our game
        const btnTurnLeft = this.output.querySelector('[data-tdc="turn-left"]');
        const btnTurnRight = this.output.querySelector('[data-tdc="turn-right"]');
        const btnGoForwards = this.output.querySelector('[data-tdc="go-forwards"]');
        // bind the controls
        const unbind = tdc.util.setupControls(variables, (name) => Engine.play(name), gameView, { btnTurnLeft, btnTurnRight, btnGoForwards }, changeListener);

        // on enter next passage
        $(document).one(':passagestart', unbind);
    },
});