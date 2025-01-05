import {createActor } from 'xstate';
import { evChargeMachine } from './index';

describe('EV Charge Station Machine Tests', () => {
  let actor;
  beforeEach(() => {
    actor = createActor(evChargeMachine);
    actor.start();
  });
  afterEach(() => {
    actor.stop();
  });
  it('Should it be idle,Should remain in idle on invalid key press', () => {
    actor.send({ type: 'invalidKey' });
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('Check the idle state', () => {
    expect(actor.getSnapshot().value).toBe('idle');
  });

  it('Should it be authorized, "a" should change to the authorized state from idle', () => { 
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    actor.send({ type: 'a' });
    expect(actor.getSnapshot().value).toBe('authorized');
  });
  it('Should it be starting ,"s" should change to the starting state from authorized.', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    actor.send({ type: 'a' });
    actor.send({ type: 's' })
    expect(actor.getSnapshot().value).toBe('starting');
  });

  it('Should it be charging ,"c" should change to the charging state from starting.', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    actor.send({ type: 'a' });
    actor.send({ type: 's' });
    actor.send({ type: 'c' });
    expect(actor.getSnapshot().value).toBe('charging');
  });

  it('Should it be stopped ,"t" should change to the stopped state from charging.', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    actor.send({ type: 'a' });
    actor.send({ type: 's' });
    actor.send({ type: 'c' });
    actor.send({ type: 't' });
    expect(actor.getSnapshot().value).toBe('stopped');
  });

  it('Should it be stopped,"r" should reset to idle state from any state', () => {
    jest.spyOn(Math, 'random').mockReturnValue(0.8);
    actor.send({ type: 'a' });
    actor.send({ type: 's' });
    actor.send({ type: 'r' });
    expect(actor.getSnapshot().value).toBe('idle');
  });

});
