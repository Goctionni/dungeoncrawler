import { FacePos, Facing, FacingPos, MapDefinition, Pos, Tile } from "@/types/Map.types";

export const canMoveForwards = (map: MapDefinition, x: number, y: number, facing: Facing): boolean => {
    const tiles = map.tiles;
    const key = `${x}:${y}`;
    const tile = tiles[key] || {};
    return !tile[facing];
}

export const rightFrom = (facing: Facing): Facing => {
  switch(facing) {
    case 'north':
      return 'east';
    case 'east':
      return 'south';
    case 'south':
      return 'west';
    case 'west':
      return 'north';
  }
}

export const leftFrom = (facing: Facing): Facing => {
  switch(facing) {
    case 'north':
      return 'west';
    case 'east':
      return 'north';
    case 'south':
      return 'east';
    case 'west':
      return 'south';
  }
}


export const goTowards = (facing: Facing): Pos => {
  switch(facing) {
    case 'north':
      return { x: 0, y: -1 };
    case 'east':
      return { x: 1, y: 0 };
    case 'south':
      return { x: 0, y: 1 };
    case 'west':
      return { x: -1, y: 0 };
  }
}

const hasFace = (knownFaces: FacePos[], face: FacePos): boolean => {
  return knownFaces.some((f) => f.x === face.x && f.y === face.y && f.facing === face.facing);
}

export const addToKnownFaces = (player: FacingPos, map: MapDefinition, knownFaces: FacePos[]): FacePos[] => {
  const playerPosKey = `${player.x}:${player.y}`;
  const playerTile: Tile = map.tiles[playerPosKey];
  if (!playerTile) return knownFaces;
  knownFaces = knownFaces.slice();
  for (const face of playerTile.faces) {
    if (!playerTile[face]) continue;
    const testFace = { x: playerTile.x, y: playerTile.y, facing: face };
    if (!hasFace(knownFaces, testFace)) knownFaces.push(testFace);
  }
  if (!playerTile[player.facing]) {
    const playerFacingDelta = goTowards(player.facing);
    const playerFacingPos: Pos = { x: player.x + playerFacingDelta.x, y: player.y + playerFacingDelta.y };
    const playerFacingKey = `${playerFacingPos.x}:${playerFacingPos.y}`;
    const playerFacingTile = map.tiles[playerFacingKey];
    if (playerFacingTile?.floor) {
      const testFace: FacePos = { x: playerFacingPos.x, y: playerFacingPos.y, facing: 'floor' };
      if (!hasFace(knownFaces, testFace)) knownFaces.push(testFace);
    }
  }
  return knownFaces;
};

export interface IGameView extends Vue {
  map: MapDefinition;
  x: number;
  y: number;
  facing: Facing;
}

type GotoPassage = (passageName: string) => void;

type VariablesFn = () => { tdcFacing: Facing };

type DestroyFn = () => void;

interface ControlElements {
  btnTurnLeft?: HTMLElement;
  btnTurnRight?: HTMLElement;
  btnGoForwards?: HTMLElement;
}

export const setupControls = (variablesFn: VariablesFn, gotoPassage: GotoPassage, gameView: IGameView, controlElements: ControlElements, changeListener?: () => void): DestroyFn => {
  let isActionBusy = false;
  const { map, x, y } = gameView;
  let { facing } = gameView;
  gameView.$on('actionComplete', () => isActionBusy = false);

  const updateCanMoveForwards = () => {
    if(canMoveForwards(map, x, y, facing)) {
      controlElements.btnGoForwards?.removeAttribute('disabled');
    } else {
      controlElements.btnGoForwards?.setAttribute('disabled', 'disabled');
    }
  }

  const setFacingTo = (newFacing: Facing) => {
    if (isActionBusy) return;
    isActionBusy = true;
    facing = newFacing;
    gameView.facing = facing;
    variablesFn().tdcFacing = facing;
    updateCanMoveForwards();
    if (changeListener) changeListener();
  };

  const turnLeft = () => {
    setFacingTo(leftFrom(facing));
  };

  const turnRight = () => {
    setFacingTo(rightFrom(facing));
  };

  const goForwards = (unbindCallback: () => void) => {
    if (isActionBusy || !canMoveForwards(map, x, y, facing)) {
      return;
    }
    isActionBusy = true;
    unbindCallback();
    const move = goTowards(facing);
    gameView.x = x + move.x;
    gameView.y = y + move.y;
    if (changeListener) changeListener();

    gameView.$on('actionComplete', (action: string) => {
      if (action === 'go-forwards') {
        gameView.$destroy();
        gotoPassage(`tdc-${map.name} (${x + move.x},${y + move.y})`);
      }
    })
  };

  // variable to store goForwardsWrapper
  let goForwardsFn: () => void; // eslint-disable-line prefer-const
  // keyListener
  const keyListener = (e: KeyboardEvent): void => {
    if (e.key === 'a') turnLeft();
    else if (e.key === 'w') goForwardsFn();
    else if (e.key === 'd') turnRight();
  }
  // Unbind fn
  const unbindFn = () => {
    controlElements.btnTurnLeft?.removeEventListener('click', turnLeft);
    controlElements.btnTurnRight?.removeEventListener('click', turnRight);
    controlElements.btnGoForwards?.removeEventListener('click', goForwardsFn);
    document.body.removeEventListener('keydown', keyListener);
  }
  goForwardsFn = () => goForwards(unbindFn);

  // Bind actions
  controlElements.btnTurnLeft?.addEventListener('click', turnLeft);
  controlElements.btnTurnRight?.addEventListener('click', turnRight);
  controlElements.btnGoForwards?.addEventListener('click', goForwardsFn);
  document.body.addEventListener('keydown', keyListener);
  updateCanMoveForwards();

  return () => {
    unbindFn();
    gameView.$destroy();
  }
};