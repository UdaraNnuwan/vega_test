import { createMachine, createActor, assign } from 'xstate';
import readline from 'readline';

const readLine = readline.createInterface({
  input: process.stdin
});

const stateOptions = {
  idle: "Options: Press 'a' to authorize, 'f' to simulate failure, 'q' to quit",
  authorized: "Options: Press 's' to start, 'r' to reset, 'q' to quit",
  authorizationFailed: "Options: Press 'a' to retry authorization, 'r' to reset, 'q' to quit",
  starting: "Options: Press 'c' to start charging, 'r' to reset, 'q' to quit",
  charging: "Options: Press 't' to stop charging, 'r' to reset, 'q' to quit",
  stopped: "Options: Press 'r' to reset, 'q' to quit",
};

const evChargeMachine = createMachine({
  /** @xstate-layout N4IgpgJg5mDOIC5RgG4GEAWBDATjAslgMYYCWAdmAHSkQA2YAxFgNoAMAuoqAA4D2sUgBdSfctxAAPRAA4AjAGYqcgKwA2VQHY1MgCwBOBboBMAGhABPRCv1yqx42pUmFMhXM3yAvl-OpMuATEZJQ09EwAZuxcSCD8giJiEtII8kqqGiraeoYm5lYIujIyVLoqCmyGcmoGcvp6Pn7o2HhghCQU1FgArkIYfDikAF6QjLDREvHCouKxKdVqmvZG7jlqxgqb+YgVxsrGBmps5bquKsaN4M2BbcGdVD19A8OjOBOxU4mzoPOuJSuaNi6TTGfSLOTbBDGTR2TQGfSAhHA4xsOSXfwtIIdUKPfqDIZYL4AMSwpAYEGY714AmmSTmiDkByUChsFTqCmhB0hpxUpW0JxUckZIIU6OurXaIS6vTxw0JMxJZNeVLiNK+yVk+l0yhkcLkulRcNykIU+j28IRilNmnO6jFAQld1CsCEuBE5CgjDenEmapmGoQCyWG1OcjWGy2lgZZSoCiN8l0qmOBhU9sxt2x1BdboonqIKs+-vpgbUi2WofDmwUkK1VF1BhkbB0Df0WrTN0l9xIgVzjCEBb9dJ+iGM5yolTjxjc1Tj+pUJv0vP17jBMmMjKnmnbjszVG7eF73pi1ISReHULHE5B07Us7KkPUShkVRZRXK2l026xUqoLr4PB4ZUfQ+Qdvikawih1OFEzKFwEQXJdQ1XdcHF1HxfBAcg+AgOAJAxDsnTAX1TyHcCEAAWjUSFKK-DMf1oBhiNpMCUlvfQoJMdYbU0BQnBNXV7Ecc5AWcIVFFozscRlZ4RggJj1WLfVn1jU4dEXQVqk0TRIUcNR9gbDxGzYestww-Cdx-XEZPlMRFXJeSzzIuQgXY-Vk3KNhNi0mQF3Y4EnGhNggVNZ8JMI39XRwd0oAc0j5htEoQwqTYPB4yF5FKVtWx4xNS2M0UzPFb8u0xXNYpYxA8ijBAVioGp3B5IV5EqMLdz-ADIHKgNaqvRRFE8HQuWqow9OXUcZHOddFF0NR0K8IA */
  id: 'evChargeMachine',
  context: { authorization: false, previousState: null ,currentState:'idle'},
  initial: 'idle',
  states: {
    idle: {
      entry: [assign({
        previousState: (context) => context.context.currentState, 
        currentState: () => 'idle',
      })],
      on: {
        a: {guard: 'authorize',target: 'authorized'},
        f: { target: 'authorizationFailed'}
      },
    },
    authorized: {
      entry: [assign({
        previousState: (context) => context.context.currentState, 
        currentState: () => 'authorized',
      }),'logState'],
      on: {
        s: { target: 'starting'},
        r: { target: 'idle' }
      }
    },
    authorizationFailed: {
      entry: [assign({
        previousState: (context) => context.currentState,
        currentState: () => 'authorizationFailed',
      }), 'logState'],
      on: {
        a: { guard: 'authorize',target: 'authorized'},
        r: { target: 'idle', actions: ['logTransition'] }
      }
    },
    starting: {
      entry: [assign({
        previousState: (context) => context.context.currentState,
        currentState: () => 'starting',
      }),'logTransition','logState'],
      on: {
        r: {
          target: "idle",
          reenter: true,
        },
        c: {
          target: "charging",
          reenter: true,
        },
      }
    },
    charging: {
      entry: [assign({
        previousState: (context) => context.context.currentState,
        currentState: () => 'charging',
      }),'logTransition','logState',
      // 'startChargingTimer'
    ],
      on: {
        t: { target: 'stopped'},
        r: { target: 'idle'}
      }
    },
    stopped: {
      entry: [assign({
        previousState: (context) => context.context.currentState,
        currentState: () => 'stopped',
      }),'logTransition','logState'],
      on: {
        r: { target: 'idle'}
      }
    }
  },
},
{
  guards: {
    authorize: () => {
      const isAuthorized = Math.random()>0.5;
      console.log(isAuthorized ? 'Authorization Success!' : 'Authorization Failed!');
      return isAuthorized;
    }
  },
  actions: {
    logState: (context, event) => {
      const currentState = context.context.currentState;
      console.log(`Entered ${currentState} state.\n`);
    },
    logTransition: (context, event) => {
      console.log(`Transition From ${context.context.previousState} To ${context.context.currentState} on ${context.event.type}`)
    },
    // startChargingTimer: (context, event) => {
    //   setTimeout(() => {
    //     actor.send({ type: 't' });
    //   }, 5000);
    // },
    // checkCredentials: (context, event) => {
    //   console.log('Please enter your credentials.');
    //   readLine.question('Username: ', (username) => {
    //     readLine.question('Password: ', (password) => {
    //       if (username === 'admin' && password === 'admin1234') {
    //         console.log('Authentication successful!');
    //         actor.send({ type: 'a' })
    //         setTimeout(() => {
    //           console.log(stateOptions['authorized'] || "No options available for this state.");
    //         }, 0);
    //       } else {
    //         console.log('Invalid credentials. Please try again.');
    //         actor.send({ type: 'r' })
    //         actor.send({ type: 'a' })
    //       }
    //     });
    //   });
    // },
  }
});

const actor = createActor(evChargeMachine);
actor.start();
actor.subscribe((state) => 
{
    console.log(stateOptions[state.value] || "No options available for this state.");
});

const inputKeys= ['a', 'f', 's', 'c', 't', 'r','q'];
console.log("Instructions:\nPress 'a' to authorize,\nPress 'f' to simulate failure\nPress 'r' to reset\nPress 'q' to quite");
readLine.on('line', (input) => {
  if(input=='q'){
    console.log("Exiting the application...");
    readLine.close();
    process.exit(0);

  }
  if (inputKeys.includes(input)) {
    actor.send({ type: input });
  } else {
    console.log("Invalid key. Try again.");
  }
});