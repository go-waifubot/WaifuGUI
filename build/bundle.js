
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function assign(tar, src) {
        // @ts-ignore
        for (const k in src)
            tar[k] = src[k];
        return tar;
    }
    function is_promise(value) {
        return value && typeof value === 'object' && typeof value.then === 'function';
    }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function create_slot(definition, ctx, $$scope, fn) {
        if (definition) {
            const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
            return definition[0](slot_ctx);
        }
    }
    function get_slot_context(definition, ctx, $$scope, fn) {
        return definition[1] && fn
            ? assign($$scope.ctx.slice(), definition[1](fn(ctx)))
            : $$scope.ctx;
    }
    function get_slot_changes(definition, $$scope, dirty, fn) {
        if (definition[2] && fn) {
            const lets = definition[2](fn(dirty));
            if ($$scope.dirty === undefined) {
                return lets;
            }
            if (typeof lets === 'object') {
                const merged = [];
                const len = Math.max($$scope.dirty.length, lets.length);
                for (let i = 0; i < len; i += 1) {
                    merged[i] = $$scope.dirty[i] | lets[i];
                }
                return merged;
            }
            return $$scope.dirty | lets;
        }
        return $$scope.dirty;
    }
    function update_slot(slot, slot_definition, ctx, $$scope, dirty, get_slot_changes_fn, get_slot_context_fn) {
        const slot_changes = get_slot_changes(slot_definition, $$scope, dirty, get_slot_changes_fn);
        if (slot_changes) {
            const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
            slot.p(slot_context, slot_changes);
        }
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function destroy_each(iterations, detaching) {
        for (let i = 0; i < iterations.length; i += 1) {
            if (iterations[i])
                iterations[i].d(detaching);
        }
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function set_input_value(input, value) {
        input.value = value == null ? '' : value;
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error('Function called outside component initialization');
        return current_component;
    }
    function afterUpdate(fn) {
        get_current_component().$$.after_update.push(fn);
    }
    function createEventDispatcher() {
        const component = get_current_component();
        return (type, detail) => {
            const callbacks = component.$$.callbacks[type];
            if (callbacks) {
                // TODO are there situations where events could be dispatched
                // in a server (non-DOM) environment?
                const event = custom_event(type, detail);
                callbacks.slice().forEach(fn => {
                    fn.call(component, event);
                });
            }
        };
    }
    // TODO figure out if we still want to support
    // shorthand events, or if we want to implement
    // a real bubbling mechanism
    function bubble(component, event) {
        const callbacks = component.$$.callbacks[event.type];
        if (callbacks) {
            callbacks.slice().forEach(fn => fn(event));
        }
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function tick() {
        schedule_update();
        return resolved_promise;
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    function add_flush_callback(fn) {
        flush_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    function handle_promise(promise, info) {
        const token = info.token = {};
        function update(type, index, key, value) {
            if (info.token !== token)
                return;
            info.resolved = value;
            let child_ctx = info.ctx;
            if (key !== undefined) {
                child_ctx = child_ctx.slice();
                child_ctx[key] = value;
            }
            const block = type && (info.current = type)(child_ctx);
            let needs_flush = false;
            if (info.block) {
                if (info.blocks) {
                    info.blocks.forEach((block, i) => {
                        if (i !== index && block) {
                            group_outros();
                            transition_out(block, 1, 1, () => {
                                if (info.blocks[i] === block) {
                                    info.blocks[i] = null;
                                }
                            });
                            check_outros();
                        }
                    });
                }
                else {
                    info.block.d(1);
                }
                block.c();
                transition_in(block, 1);
                block.m(info.mount(), info.anchor);
                needs_flush = true;
            }
            info.block = block;
            if (info.blocks)
                info.blocks[index] = block;
            if (needs_flush) {
                flush();
            }
        }
        if (is_promise(promise)) {
            const current_component = get_current_component();
            promise.then(value => {
                set_current_component(current_component);
                update(info.then, 1, info.value, value);
                set_current_component(null);
            }, error => {
                set_current_component(current_component);
                update(info.catch, 2, info.error, error);
                set_current_component(null);
                if (!info.hasCatch) {
                    throw error;
                }
            });
            // if we previously had a then/catch block, destroy it
            if (info.current !== info.pending) {
                update(info.pending, 0);
                return true;
            }
        }
        else {
            if (info.current !== info.then) {
                update(info.then, 1, info.value, promise);
                return true;
            }
            info.resolved = promise;
        }
    }
    function update_await_block_branch(info, ctx, dirty) {
        const child_ctx = ctx.slice();
        const { resolved } = info;
        if (info.current === info.then) {
            child_ctx[info.value] = resolved;
        }
        if (info.current === info.catch) {
            child_ctx[info.error] = resolved;
        }
        info.block.p(child_ctx, dirty);
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);

    function get_spread_update(levels, updates) {
        const update = {};
        const to_null_out = {};
        const accounted_for = { $$scope: 1 };
        let i = levels.length;
        while (i--) {
            const o = levels[i];
            const n = updates[i];
            if (n) {
                for (const key in o) {
                    if (!(key in n))
                        to_null_out[key] = 1;
                }
                for (const key in n) {
                    if (!accounted_for[key]) {
                        update[key] = n[key];
                        accounted_for[key] = 1;
                    }
                }
                levels[i] = n;
            }
            else {
                for (const key in o) {
                    accounted_for[key] = 1;
                }
            }
        }
        for (const key in to_null_out) {
            if (!(key in update))
                update[key] = undefined;
        }
        return update;
    }
    function get_spread_object(spread_props) {
        return typeof spread_props === 'object' && spread_props !== null ? spread_props : {};
    }

    function bind(component, name, callback) {
        const index = component.$$.props[name];
        if (index !== undefined) {
            component.$$.bound[index] = callback;
            callback(component.$$.ctx[index]);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : options.context || []),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.38.2' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_each_argument(arg) {
        if (typeof arg !== 'string' && !(arg && typeof arg === 'object' && 'length' in arg)) {
            let msg = '{#each} only iterates over array-like objects.';
            if (typeof Symbol === 'function' && arg && Symbol.iterator in arg) {
                msg += ' You can use a spread to convert this iterable into an array.';
            }
            throw new Error(msg);
        }
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /**
     * @typedef {Object} WrappedComponent Object returned by the `wrap` method
     * @property {SvelteComponent} component - Component to load (this is always asynchronous)
     * @property {RoutePrecondition[]} [conditions] - Route pre-conditions to validate
     * @property {Object} [props] - Optional dictionary of static props
     * @property {Object} [userData] - Optional user data dictionary
     * @property {bool} _sveltesparouter - Internal flag; always set to true
     */

    /**
     * @callback AsyncSvelteComponent
     * @returns {Promise<SvelteComponent>} Returns a Promise that resolves with a Svelte component
     */

    /**
     * @callback RoutePrecondition
     * @param {RouteDetail} detail - Route detail object
     * @returns {boolean|Promise<boolean>} If the callback returns a false-y value, it's interpreted as the precondition failed, so it aborts loading the component (and won't process other pre-condition callbacks)
     */

    /**
     * @typedef {Object} WrapOptions Options object for the call to `wrap`
     * @property {SvelteComponent} [component] - Svelte component to load (this is incompatible with `asyncComponent`)
     * @property {AsyncSvelteComponent} [asyncComponent] - Function that returns a Promise that fulfills with a Svelte component (e.g. `{asyncComponent: () => import('Foo.svelte')}`)
     * @property {SvelteComponent} [loadingComponent] - Svelte component to be displayed while the async route is loading (as a placeholder); when unset or false-y, no component is shown while component
     * @property {object} [loadingParams] - Optional dictionary passed to the `loadingComponent` component as params (for an exported prop called `params`)
     * @property {object} [userData] - Optional object that will be passed to events such as `routeLoading`, `routeLoaded`, `conditionsFailed`
     * @property {object} [props] - Optional key-value dictionary of static props that will be passed to the component. The props are expanded with {...props}, so the key in the dictionary becomes the name of the prop.
     * @property {RoutePrecondition[]|RoutePrecondition} [conditions] - Route pre-conditions to add, which will be executed in order
     */

    /**
     * Wraps a component to enable multiple capabilities:
     * 1. Using dynamically-imported component, with (e.g. `{asyncComponent: () => import('Foo.svelte')}`), which also allows bundlers to do code-splitting.
     * 2. Adding route pre-conditions (e.g. `{conditions: [...]}`)
     * 3. Adding static props that are passed to the component
     * 4. Adding custom userData, which is passed to route events (e.g. route loaded events) or to route pre-conditions (e.g. `{userData: {foo: 'bar}}`)
     * 
     * @param {WrapOptions} args - Arguments object
     * @returns {WrappedComponent} Wrapped component
     */
    function wrap$1(args) {
        if (!args) {
            throw Error('Parameter args is required')
        }

        // We need to have one and only one of component and asyncComponent
        // This does a "XNOR"
        if (!args.component == !args.asyncComponent) {
            throw Error('One and only one of component and asyncComponent is required')
        }

        // If the component is not async, wrap it into a function returning a Promise
        if (args.component) {
            args.asyncComponent = () => Promise.resolve(args.component);
        }

        // Parameter asyncComponent and each item of conditions must be functions
        if (typeof args.asyncComponent != 'function') {
            throw Error('Parameter asyncComponent must be a function')
        }
        if (args.conditions) {
            // Ensure it's an array
            if (!Array.isArray(args.conditions)) {
                args.conditions = [args.conditions];
            }
            for (let i = 0; i < args.conditions.length; i++) {
                if (!args.conditions[i] || typeof args.conditions[i] != 'function') {
                    throw Error('Invalid parameter conditions[' + i + ']')
                }
            }
        }

        // Check if we have a placeholder component
        if (args.loadingComponent) {
            args.asyncComponent.loading = args.loadingComponent;
            args.asyncComponent.loadingParams = args.loadingParams || undefined;
        }

        // Returns an object that contains all the functions to execute too
        // The _sveltesparouter flag is to confirm the object was created by this router
        const obj = {
            component: args.asyncComponent,
            userData: args.userData,
            conditions: (args.conditions && args.conditions.length) ? args.conditions : undefined,
            props: (args.props && Object.keys(args.props).length) ? args.props : {},
            _sveltesparouter: true
        };

        return obj
    }

    const subscriber_queue = [];
    /**
     * Creates a `Readable` store that allows reading by subscription.
     * @param value initial value
     * @param {StartStopNotifier}start start and stop notifications for subscriptions
     */
    function readable(value, start) {
        return {
            subscribe: writable(value, start).subscribe
        };
    }
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = [];
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (let i = 0; i < subscribers.length; i += 1) {
                        const s = subscribers[i];
                        s[1]();
                        subscriber_queue.push(s, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.push(subscriber);
            if (subscribers.length === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                const index = subscribers.indexOf(subscriber);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
                if (subscribers.length === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }
    function derived(stores, fn, initial_value) {
        const single = !Array.isArray(stores);
        const stores_array = single
            ? [stores]
            : stores;
        const auto = fn.length < 2;
        return readable(initial_value, (set) => {
            let inited = false;
            const values = [];
            let pending = 0;
            let cleanup = noop;
            const sync = () => {
                if (pending) {
                    return;
                }
                cleanup();
                const result = fn(single ? values[0] : values, set);
                if (auto) {
                    set(result);
                }
                else {
                    cleanup = is_function(result) ? result : noop;
                }
            };
            const unsubscribers = stores_array.map((store, i) => subscribe(store, (value) => {
                values[i] = value;
                pending &= ~(1 << i);
                if (inited) {
                    sync();
                }
            }, () => {
                pending |= (1 << i);
            }));
            inited = true;
            sync();
            return function stop() {
                run_all(unsubscribers);
                cleanup();
            };
        });
    }

    function regexparam (str, loose) {
    	if (str instanceof RegExp) return { keys:false, pattern:str };
    	var c, o, tmp, ext, keys=[], pattern='', arr = str.split('/');
    	arr[0] || arr.shift();

    	while (tmp = arr.shift()) {
    		c = tmp[0];
    		if (c === '*') {
    			keys.push('wild');
    			pattern += '/(.*)';
    		} else if (c === ':') {
    			o = tmp.indexOf('?', 1);
    			ext = tmp.indexOf('.', 1);
    			keys.push( tmp.substring(1, !!~o ? o : !!~ext ? ext : tmp.length) );
    			pattern += !!~o && !~ext ? '(?:/([^/]+?))?' : '/([^/]+?)';
    			if (!!~ext) pattern += (!!~o ? '?' : '') + '\\' + tmp.substring(ext);
    		} else {
    			pattern += '/' + tmp;
    		}
    	}

    	return {
    		keys: keys,
    		pattern: new RegExp('^' + pattern + (loose ? '(?=$|\/)' : '\/?$'), 'i')
    	};
    }

    /* node_modules/svelte-spa-router/Router.svelte generated by Svelte v3.38.2 */

    const { Error: Error_1, Object: Object_1$1, console: console_1$1 } = globals;

    // (209:0) {:else}
    function create_else_block$2(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [/*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*props*/ 4)
    			? get_spread_update(switch_instance_spread_levels, [get_spread_object(/*props*/ ctx[2])])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler_1*/ ctx[7]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$2.name,
    		type: "else",
    		source: "(209:0) {:else}",
    		ctx
    	});

    	return block;
    }

    // (202:0) {#if componentParams}
    function create_if_block$5(ctx) {
    	let switch_instance;
    	let switch_instance_anchor;
    	let current;
    	const switch_instance_spread_levels = [{ params: /*componentParams*/ ctx[1] }, /*props*/ ctx[2]];
    	var switch_value = /*component*/ ctx[0];

    	function switch_props(ctx) {
    		let switch_instance_props = {};

    		for (let i = 0; i < switch_instance_spread_levels.length; i += 1) {
    			switch_instance_props = assign(switch_instance_props, switch_instance_spread_levels[i]);
    		}

    		return {
    			props: switch_instance_props,
    			$$inline: true
    		};
    	}

    	if (switch_value) {
    		switch_instance = new switch_value(switch_props());
    		switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    	}

    	const block = {
    		c: function create() {
    			if (switch_instance) create_component(switch_instance.$$.fragment);
    			switch_instance_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if (switch_instance) {
    				mount_component(switch_instance, target, anchor);
    			}

    			insert_dev(target, switch_instance_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const switch_instance_changes = (dirty & /*componentParams, props*/ 6)
    			? get_spread_update(switch_instance_spread_levels, [
    					dirty & /*componentParams*/ 2 && { params: /*componentParams*/ ctx[1] },
    					dirty & /*props*/ 4 && get_spread_object(/*props*/ ctx[2])
    				])
    			: {};

    			if (switch_value !== (switch_value = /*component*/ ctx[0])) {
    				if (switch_instance) {
    					group_outros();
    					const old_component = switch_instance;

    					transition_out(old_component.$$.fragment, 1, 0, () => {
    						destroy_component(old_component, 1);
    					});

    					check_outros();
    				}

    				if (switch_value) {
    					switch_instance = new switch_value(switch_props());
    					switch_instance.$on("routeEvent", /*routeEvent_handler*/ ctx[6]);
    					create_component(switch_instance.$$.fragment);
    					transition_in(switch_instance.$$.fragment, 1);
    					mount_component(switch_instance, switch_instance_anchor.parentNode, switch_instance_anchor);
    				} else {
    					switch_instance = null;
    				}
    			} else if (switch_value) {
    				switch_instance.$set(switch_instance_changes);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			if (switch_instance) transition_in(switch_instance.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			if (switch_instance) transition_out(switch_instance.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(switch_instance_anchor);
    			if (switch_instance) destroy_component(switch_instance, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$5.name,
    		type: "if",
    		source: "(202:0) {#if componentParams}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$9(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$5, create_else_block$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*componentParams*/ ctx[1]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error_1("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$9.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function wrap(component, userData, ...conditions) {
    	// Use the new wrap method and show a deprecation warning
    	// eslint-disable-next-line no-console
    	console.warn("Method `wrap` from `svelte-spa-router` is deprecated and will be removed in a future version. Please use `svelte-spa-router/wrap` instead. See http://bit.ly/svelte-spa-router-upgrading");

    	return wrap$1({ component, userData, conditions });
    }

    /**
     * @typedef {Object} Location
     * @property {string} location - Location (page/view), for example `/book`
     * @property {string} [querystring] - Querystring from the hash, as a string not parsed
     */
    /**
     * Returns the current location from the hash.
     *
     * @returns {Location} Location object
     * @private
     */
    function getLocation() {
    	const hashPosition = window.location.href.indexOf("#/");

    	let location = hashPosition > -1
    	? window.location.href.substr(hashPosition + 1)
    	: "/";

    	// Check if there's a querystring
    	const qsPosition = location.indexOf("?");

    	let querystring = "";

    	if (qsPosition > -1) {
    		querystring = location.substr(qsPosition + 1);
    		location = location.substr(0, qsPosition);
    	}

    	return { location, querystring };
    }

    const loc = readable(null, // eslint-disable-next-line prefer-arrow-callback
    function start(set) {
    	set(getLocation());

    	const update = () => {
    		set(getLocation());
    	};

    	window.addEventListener("hashchange", update, false);

    	return function stop() {
    		window.removeEventListener("hashchange", update, false);
    	};
    });

    const location = derived(loc, $loc => $loc.location);
    const querystring = derived(loc, $loc => $loc.querystring);

    async function push(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	// Note: this will include scroll state in history even when restoreScrollState is false
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	window.location.hash = (location.charAt(0) == "#" ? "" : "#") + location;
    }

    async function pop() {
    	// Execute this code when the current call stack is complete
    	await tick();

    	window.history.back();
    }

    async function replace(location) {
    	if (!location || location.length < 1 || location.charAt(0) != "/" && location.indexOf("#/") !== 0) {
    		throw Error("Invalid parameter location");
    	}

    	// Execute this code when the current call stack is complete
    	await tick();

    	const dest = (location.charAt(0) == "#" ? "" : "#") + location;

    	try {
    		window.history.replaceState(undefined, undefined, dest);
    	} catch(e) {
    		// eslint-disable-next-line no-console
    		console.warn("Caught exception while replacing the current page. If you're running this in the Svelte REPL, please note that the `replace` method might not work in this environment.");
    	}

    	// The method above doesn't trigger the hashchange event, so let's do that manually
    	window.dispatchEvent(new Event("hashchange"));
    }

    function link(node, hrefVar) {
    	// Only apply to <a> tags
    	if (!node || !node.tagName || node.tagName.toLowerCase() != "a") {
    		throw Error("Action \"link\" can only be used with <a> tags");
    	}

    	updateLink(node, hrefVar || node.getAttribute("href"));

    	return {
    		update(updated) {
    			updateLink(node, updated);
    		}
    	};
    }

    // Internal function used by the link function
    function updateLink(node, href) {
    	// Destination must start with '/'
    	if (!href || href.length < 1 || href.charAt(0) != "/") {
    		throw Error("Invalid value for \"href\" attribute: " + href);
    	}

    	// Add # to the href attribute
    	node.setAttribute("href", "#" + href);

    	node.addEventListener("click", scrollstateHistoryHandler);
    }

    /**
     * The handler attached to an anchor tag responsible for updating the
     * current history state with the current scroll state
     *
     * @param {HTMLElementEventMap} event - an onclick event attached to an anchor tag
     */
    function scrollstateHistoryHandler(event) {
    	// Prevent default anchor onclick behaviour
    	event.preventDefault();

    	const href = event.currentTarget.getAttribute("href");

    	// Setting the url (3rd arg) to href will break clicking for reasons, so don't try to do that
    	history.replaceState(
    		{
    			scrollX: window.scrollX,
    			scrollY: window.scrollY
    		},
    		undefined,
    		undefined
    	);

    	// This will force an update as desired, but this time our scroll state will be attached
    	window.location.hash = href;
    }

    function instance$9($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Router", slots, []);
    	let { routes = {} } = $$props;
    	let { prefix = "" } = $$props;
    	let { restoreScrollState = false } = $$props;

    	/**
     * Container for a route: path, component
     */
    	class RouteItem {
    		/**
     * Initializes the object and creates a regular expression from the path, using regexparam.
     *
     * @param {string} path - Path to the route (must start with '/' or '*')
     * @param {SvelteComponent|WrappedComponent} component - Svelte component for the route, optionally wrapped
     */
    		constructor(path, component) {
    			if (!component || typeof component != "function" && (typeof component != "object" || component._sveltesparouter !== true)) {
    				throw Error("Invalid component object");
    			}

    			// Path must be a regular or expression, or a string starting with '/' or '*'
    			if (!path || typeof path == "string" && (path.length < 1 || path.charAt(0) != "/" && path.charAt(0) != "*") || typeof path == "object" && !(path instanceof RegExp)) {
    				throw Error("Invalid value for \"path\" argument - strings must start with / or *");
    			}

    			const { pattern, keys } = regexparam(path);
    			this.path = path;

    			// Check if the component is wrapped and we have conditions
    			if (typeof component == "object" && component._sveltesparouter === true) {
    				this.component = component.component;
    				this.conditions = component.conditions || [];
    				this.userData = component.userData;
    				this.props = component.props || {};
    			} else {
    				// Convert the component to a function that returns a Promise, to normalize it
    				this.component = () => Promise.resolve(component);

    				this.conditions = [];
    				this.props = {};
    			}

    			this._pattern = pattern;
    			this._keys = keys;
    		}

    		/**
     * Checks if `path` matches the current route.
     * If there's a match, will return the list of parameters from the URL (if any).
     * In case of no match, the method will return `null`.
     *
     * @param {string} path - Path to test
     * @returns {null|Object.<string, string>} List of paramters from the URL if there's a match, or `null` otherwise.
     */
    		match(path) {
    			// If there's a prefix, check if it matches the start of the path.
    			// If not, bail early, else remove it before we run the matching.
    			if (prefix) {
    				if (typeof prefix == "string") {
    					if (path.startsWith(prefix)) {
    						path = path.substr(prefix.length) || "/";
    					} else {
    						return null;
    					}
    				} else if (prefix instanceof RegExp) {
    					const match = path.match(prefix);

    					if (match && match[0]) {
    						path = path.substr(match[0].length) || "/";
    					} else {
    						return null;
    					}
    				}
    			}

    			// Check if the pattern matches
    			const matches = this._pattern.exec(path);

    			if (matches === null) {
    				return null;
    			}

    			// If the input was a regular expression, this._keys would be false, so return matches as is
    			if (this._keys === false) {
    				return matches;
    			}

    			const out = {};
    			let i = 0;

    			while (i < this._keys.length) {
    				// In the match parameters, URL-decode all values
    				try {
    					out[this._keys[i]] = decodeURIComponent(matches[i + 1] || "") || null;
    				} catch(e) {
    					out[this._keys[i]] = null;
    				}

    				i++;
    			}

    			return out;
    		}

    		/**
     * Dictionary with route details passed to the pre-conditions functions, as well as the `routeLoading`, `routeLoaded` and `conditionsFailed` events
     * @typedef {Object} RouteDetail
     * @property {string|RegExp} route - Route matched as defined in the route definition (could be a string or a reguar expression object)
     * @property {string} location - Location path
     * @property {string} querystring - Querystring from the hash
     * @property {object} [userData] - Custom data passed by the user
     * @property {SvelteComponent} [component] - Svelte component (only in `routeLoaded` events)
     * @property {string} [name] - Name of the Svelte component (only in `routeLoaded` events)
     */
    		/**
     * Executes all conditions (if any) to control whether the route can be shown. Conditions are executed in the order they are defined, and if a condition fails, the following ones aren't executed.
     * 
     * @param {RouteDetail} detail - Route detail
     * @returns {bool} Returns true if all the conditions succeeded
     */
    		async checkConditions(detail) {
    			for (let i = 0; i < this.conditions.length; i++) {
    				if (!await this.conditions[i](detail)) {
    					return false;
    				}
    			}

    			return true;
    		}
    	}

    	// Set up all routes
    	const routesList = [];

    	if (routes instanceof Map) {
    		// If it's a map, iterate on it right away
    		routes.forEach((route, path) => {
    			routesList.push(new RouteItem(path, route));
    		});
    	} else {
    		// We have an object, so iterate on its own properties
    		Object.keys(routes).forEach(path => {
    			routesList.push(new RouteItem(path, routes[path]));
    		});
    	}

    	// Props for the component to render
    	let component = null;

    	let componentParams = null;
    	let props = {};

    	// Event dispatcher from Svelte
    	const dispatch = createEventDispatcher();

    	// Just like dispatch, but executes on the next iteration of the event loop
    	async function dispatchNextTick(name, detail) {
    		// Execute this code when the current call stack is complete
    		await tick();

    		dispatch(name, detail);
    	}

    	// If this is set, then that means we have popped into this var the state of our last scroll position
    	let previousScrollState = null;

    	if (restoreScrollState) {
    		window.addEventListener("popstate", event => {
    			// If this event was from our history.replaceState, event.state will contain
    			// our scroll history. Otherwise, event.state will be null (like on forward
    			// navigation)
    			if (event.state && event.state.scrollY) {
    				previousScrollState = event.state;
    			} else {
    				previousScrollState = null;
    			}
    		});

    		afterUpdate(() => {
    			// If this exists, then this is a back navigation: restore the scroll position
    			if (previousScrollState) {
    				window.scrollTo(previousScrollState.scrollX, previousScrollState.scrollY);
    			} else {
    				// Otherwise this is a forward navigation: scroll to top
    				window.scrollTo(0, 0);
    			}
    		});
    	}

    	// Always have the latest value of loc
    	let lastLoc = null;

    	// Current object of the component loaded
    	let componentObj = null;

    	// Handle hash change events
    	// Listen to changes in the $loc store and update the page
    	// Do not use the $: syntax because it gets triggered by too many things
    	loc.subscribe(async newLoc => {
    		lastLoc = newLoc;

    		// Find a route matching the location
    		let i = 0;

    		while (i < routesList.length) {
    			const match = routesList[i].match(newLoc.location);

    			if (!match) {
    				i++;
    				continue;
    			}

    			const detail = {
    				route: routesList[i].path,
    				location: newLoc.location,
    				querystring: newLoc.querystring,
    				userData: routesList[i].userData
    			};

    			// Check if the route can be loaded - if all conditions succeed
    			if (!await routesList[i].checkConditions(detail)) {
    				// Don't display anything
    				$$invalidate(0, component = null);

    				componentObj = null;

    				// Trigger an event to notify the user, then exit
    				dispatchNextTick("conditionsFailed", detail);

    				return;
    			}

    			// Trigger an event to alert that we're loading the route
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoading", Object.assign({}, detail));

    			// If there's a component to show while we're loading the route, display it
    			const obj = routesList[i].component;

    			// Do not replace the component if we're loading the same one as before, to avoid the route being unmounted and re-mounted
    			if (componentObj != obj) {
    				if (obj.loading) {
    					$$invalidate(0, component = obj.loading);
    					componentObj = obj;
    					$$invalidate(1, componentParams = obj.loadingParams);
    					$$invalidate(2, props = {});

    					// Trigger the routeLoaded event for the loading component
    					// Create a copy of detail so we don't modify the object for the dynamic route (and the dynamic route doesn't modify our object too)
    					dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));
    				} else {
    					$$invalidate(0, component = null);
    					componentObj = null;
    				}

    				// Invoke the Promise
    				const loaded = await obj();

    				// Now that we're here, after the promise resolved, check if we still want this component, as the user might have navigated to another page in the meanwhile
    				if (newLoc != lastLoc) {
    					// Don't update the component, just exit
    					return;
    				}

    				// If there is a "default" property, which is used by async routes, then pick that
    				$$invalidate(0, component = loaded && loaded.default || loaded);

    				componentObj = obj;
    			}

    			// Set componentParams only if we have a match, to avoid a warning similar to `<Component> was created with unknown prop 'params'`
    			// Of course, this assumes that developers always add a "params" prop when they are expecting parameters
    			if (match && typeof match == "object" && Object.keys(match).length) {
    				$$invalidate(1, componentParams = match);
    			} else {
    				$$invalidate(1, componentParams = null);
    			}

    			// Set static props, if any
    			$$invalidate(2, props = routesList[i].props);

    			// Dispatch the routeLoaded event then exit
    			// We need to clone the object on every event invocation so we don't risk the object to be modified in the next tick
    			dispatchNextTick("routeLoaded", Object.assign({}, detail, { component, name: component.name }));

    			return;
    		}

    		// If we're still here, there was no match, so show the empty component
    		$$invalidate(0, component = null);

    		componentObj = null;
    	});

    	const writable_props = ["routes", "prefix", "restoreScrollState"];

    	Object_1$1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1$1.warn(`<Router> was created with unknown prop '${key}'`);
    	});

    	function routeEvent_handler(event) {
    		bubble($$self, event);
    	}

    	function routeEvent_handler_1(event) {
    		bubble($$self, event);
    	}

    	$$self.$$set = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    	};

    	$$self.$capture_state = () => ({
    		readable,
    		derived,
    		tick,
    		_wrap: wrap$1,
    		wrap,
    		getLocation,
    		loc,
    		location,
    		querystring,
    		push,
    		pop,
    		replace,
    		link,
    		updateLink,
    		scrollstateHistoryHandler,
    		createEventDispatcher,
    		afterUpdate,
    		regexparam,
    		routes,
    		prefix,
    		restoreScrollState,
    		RouteItem,
    		routesList,
    		component,
    		componentParams,
    		props,
    		dispatch,
    		dispatchNextTick,
    		previousScrollState,
    		lastLoc,
    		componentObj
    	});

    	$$self.$inject_state = $$props => {
    		if ("routes" in $$props) $$invalidate(3, routes = $$props.routes);
    		if ("prefix" in $$props) $$invalidate(4, prefix = $$props.prefix);
    		if ("restoreScrollState" in $$props) $$invalidate(5, restoreScrollState = $$props.restoreScrollState);
    		if ("component" in $$props) $$invalidate(0, component = $$props.component);
    		if ("componentParams" in $$props) $$invalidate(1, componentParams = $$props.componentParams);
    		if ("props" in $$props) $$invalidate(2, props = $$props.props);
    		if ("previousScrollState" in $$props) previousScrollState = $$props.previousScrollState;
    		if ("lastLoc" in $$props) lastLoc = $$props.lastLoc;
    		if ("componentObj" in $$props) componentObj = $$props.componentObj;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*restoreScrollState*/ 32) {
    			// Update history.scrollRestoration depending on restoreScrollState
    			history.scrollRestoration = restoreScrollState ? "manual" : "auto";
    		}
    	};

    	return [
    		component,
    		componentParams,
    		props,
    		routes,
    		prefix,
    		restoreScrollState,
    		routeEvent_handler,
    		routeEvent_handler_1
    	];
    }

    class Router extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$9, create_fragment$9, safe_not_equal, {
    			routes: 3,
    			prefix: 4,
    			restoreScrollState: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Router",
    			options,
    			id: create_fragment$9.name
    		});
    	}

    	get routes() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set routes(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get prefix() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set prefix(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get restoreScrollState() {
    		throw new Error_1("<Router>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set restoreScrollState(value) {
    		throw new Error_1("<Router>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/Home.svelte generated by Svelte v3.38.2 */

    const { console: console_1 } = globals;
    const file$8 = "src/routes/Home.svelte";

    function create_fragment$8(ctx) {
    	let main;
    	let div;
    	let h1;
    	let t1;
    	let img;
    	let img_src_value;
    	let t2;
    	let span;
    	let t4;
    	let input;
    	let t5;
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			main = element("main");
    			div = element("div");
    			h1 = element("h1");
    			h1.textContent = "Welcome to WaifuGUI";
    			t1 = space();
    			img = element("img");
    			t2 = space();
    			span = element("span");
    			span.textContent = "Enter a discord user ID to view the user's list";
    			t4 = space();
    			input = element("input");
    			t5 = space();
    			button = element("button");
    			button.textContent = "Search";
    			attr_dev(h1, "class", "svelte-n04uj0");
    			add_location(h1, file$8, 6, 4, 120);
    			if (img.src !== (img_src_value = "./favicon.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "icon");
    			add_location(img, file$8, 7, 4, 153);
    			attr_dev(span, "class", "svelte-n04uj0");
    			add_location(span, file$8, 8, 4, 196);
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "206794847581896705");
    			attr_dev(input, "class", "svelte-n04uj0");
    			add_location(input, file$8, 9, 4, 263);
    			attr_dev(button, "class", "svelte-n04uj0");
    			add_location(button, file$8, 10, 4, 342);
    			attr_dev(div, "class", "content svelte-n04uj0");
    			add_location(div, file$8, 5, 2, 94);
    			attr_dev(main, "class", "svelte-n04uj0");
    			add_location(main, file$8, 4, 0, 85);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			append_dev(main, div);
    			append_dev(div, h1);
    			append_dev(div, t1);
    			append_dev(div, img);
    			append_dev(div, t2);
    			append_dev(div, span);
    			append_dev(div, t4);
    			append_dev(div, input);
    			set_input_value(input, /*user*/ ctx[0]);
    			append_dev(div, t5);
    			append_dev(div, button);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[1]),
    					listen_dev(button, "click", /*click_handler*/ ctx[2], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 1 && input.value !== /*user*/ ctx[0]) {
    				set_input_value(input, /*user*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$8.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$8($$self, $$props, $$invalidate) {
    	let user;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Home", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console_1.warn(`<Home> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		user = this.value;
    		$$invalidate(0, user);
    	}

    	const click_handler = () => {
    		if (user.length < 15) {
    			console.log(user.length);
    			alert("invalid user ID");
    			return;
    		}

    		push("/list/" + user);
    	};

    	$$self.$capture_state = () => ({ push, user });

    	$$self.$inject_state = $$props => {
    		if ("user" in $$props) $$invalidate(0, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(0, user = "");
    	return [user, input_input_handler, click_handler];
    }

    class Home extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$8, create_fragment$8, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Home",
    			options,
    			id: create_fragment$8.name
    		});
    	}
    }

    class User {
        async pullInventory(user) {
            let resp = await fetch("https://waifubot.kar.wtf/user/" + user);
            try {
                let payload = (await resp.json());
                this.Date = payload.Date;
                this.Favorite = payload.Favorite;
                this.ID = payload.ID;
                this.Quote = payload.Quote;
                this.Waifus = payload.Waifus;
                return this.Waifus;
            }
            catch (e) {
                alert(e);
                pop();
            }
        }
    }
    const Inventory = writable(new User());

    /* src/component/FilterChar.svelte generated by Svelte v3.38.2 */

    const { Object: Object_1 } = globals;
    const file$7 = "src/component/FilterChar.svelte";

    function create_fragment$7(ctx) {
    	let label;
    	let t;
    	let input;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			label = element("label");
    			t = text("Name\n  ");
    			input = element("input");
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "name to search...");
    			attr_dev(input, "class", "svelte-tnxfa4");
    			add_location(input, file$7, 15, 2, 327);
    			attr_dev(label, "class", "svelte-tnxfa4");
    			add_location(label, file$7, 13, 0, 310);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t);
    			append_dev(label, input);
    			set_input_value(input, /*search_text*/ ctx[0]);

    			if (!mounted) {
    				dispose = listen_dev(input, "input", /*input_input_handler*/ ctx[2]);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*search_text*/ 1 && input.value !== /*search_text*/ ctx[0]) {
    				set_input_value(input, /*search_text*/ ctx[0]);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let search_text;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FilterChar", slots, []);
    	
    	let { filter } = $$props;
    	const writable_props = ["filter"];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FilterChar> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		search_text = this.value;
    		$$invalidate(0, search_text);
    	}

    	$$self.$$set = $$props => {
    		if ("filter" in $$props) $$invalidate(1, filter = $$props.filter);
    	};

    	$$self.$capture_state = () => ({ filter, search_text });

    	$$self.$inject_state = $$props => {
    		if ("filter" in $$props) $$invalidate(1, filter = $$props.filter);
    		if ("search_text" in $$props) $$invalidate(0, search_text = $$props.search_text);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*search_text*/ 1) {
    			$$invalidate(1, filter = w => {
    				if (search_text.length < 3) return true;
    				let reg = new RegExp(search_text, "i");

    				return Object.values(w).filter(prop => {
    					return reg.exec(prop.toString()) != null;
    				}).length > 0;
    			});
    		}
    	};

    	$$invalidate(0, search_text = "");
    	return [search_text, filter, input_input_handler];
    }

    class FilterChar extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { filter: 1 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilterChar",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*filter*/ ctx[1] === undefined && !("filter" in props)) {
    			console.warn("<FilterChar> was created without expected prop 'filter'");
    		}
    	}

    	get filter() {
    		throw new Error("<FilterChar>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<FilterChar>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const CharacterQuery = `query ($term: String, $page: Int) {
  Media(search: $term) {
    title {
      romaji
    }
    characters(sort: FAVOURITES_DESC, perPage: 50, page: $page) {
      pageInfo {
        hasNextPage
        lastPage
      }
      nodes {
        id
        name {
          full
        }
        image {
          large
        }
      }
    }
  }
}`;
    async function SearchMedia(media, page = 1) {
        let resp = await fetch("https://graphql.anilist.co", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                query: CharacterQuery,
                variables: {
                    term: media,
                    page: page,
                },
            }),
        });
        if (resp.status == 200) {
            let response = (await resp.json());
            if (response.data.Media.characters.pageInfo.hasNextPage) {
                let resp2 = await SearchMedia(media, page + 1);
                response.data.Media.characters.nodes.push(...resp2.data.Media.characters.nodes);
            }
            return response;
        }
        console.error(resp.statusText);
    }

    /* src/component/FilterMedia.svelte generated by Svelte v3.38.2 */
    const file$6 = "src/component/FilterMedia.svelte";

    // (44:2) {#if media}
    function create_if_block$4(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "x";
    			attr_dev(button, "class", "svelte-1ng652");
    			add_location(button, file$6, 44, 4, 1650);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[8], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$4.name,
    		type: "if",
    		source: "(44:2) {#if media}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let label;

    	let t0_value = (!/*media*/ ctx[1]
    	? "Media"
    	: /*media*/ ctx[1].data.Media.title.romaji) + "";

    	let t0;
    	let t1;
    	let input;
    	let t2;
    	let button;
    	let t4;
    	let mounted;
    	let dispose;
    	let if_block = /*media*/ ctx[1] && create_if_block$4(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text(t0_value);
    			t1 = space();
    			input = element("input");
    			t2 = space();
    			button = element("button");
    			button.textContent = "Search";
    			t4 = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "media to search...");
    			attr_dev(input, "class", "svelte-1ng652");
    			add_location(input, file$6, 35, 2, 1382);
    			attr_dev(button, "class", "svelte-1ng652");
    			add_location(button, file$6, 42, 2, 1564);
    			attr_dev(label, "class", "svelte-1ng652");
    			add_location(label, file$6, 33, 0, 1319);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, t1);
    			append_dev(label, input);
    			set_input_value(input, /*search_text*/ ctx[0]);
    			append_dev(label, t2);
    			append_dev(label, button);
    			append_dev(label, t4);
    			if (if_block) if_block.m(label, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[5]),
    					listen_dev(input, "keyup", /*keyup_handler*/ ctx[6], false, false, false),
    					listen_dev(button, "click", /*click_handler*/ ctx[7], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*media*/ 2 && t0_value !== (t0_value = (!/*media*/ ctx[1]
    			? "Media"
    			: /*media*/ ctx[1].data.Media.title.romaji) + "")) set_data_dev(t0, t0_value);

    			if (dirty & /*search_text*/ 1 && input.value !== /*search_text*/ ctx[0]) {
    				set_input_value(input, /*search_text*/ ctx[0]);
    			}

    			if (/*media*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$4(ctx);
    					if_block.c();
    					if_block.m(label, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("FilterMedia", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	
    	let { media_chars } = $$props;
    	let { search_text = "" } = $$props;
    	let media;
    	let { filter } = $$props;

    	function LookupMedia(search) {
    		return __awaiter(this, void 0, void 0, function* () {
    			if (search_text.length < 2) return;
    			$$invalidate(1, media = yield SearchMedia(search));
    		});
    	}

    	const writable_props = ["media_chars", "search_text", "filter"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<FilterMedia> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		search_text = this.value;
    		$$invalidate(0, search_text);
    	}

    	const keyup_handler = e => {
    		if (e.key == "Enter") LookupMedia(search_text);
    	};

    	const click_handler = () => LookupMedia(search_text);

    	const click_handler_1 = () => {
    		$$invalidate(1, media = null);
    		$$invalidate(0, search_text = "");
    	};

    	$$self.$$set = $$props => {
    		if ("media_chars" in $$props) $$invalidate(3, media_chars = $$props.media_chars);
    		if ("search_text" in $$props) $$invalidate(0, search_text = $$props.search_text);
    		if ("filter" in $$props) $$invalidate(4, filter = $$props.filter);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		SearchMedia,
    		media_chars,
    		search_text,
    		media,
    		filter,
    		LookupMedia
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("media_chars" in $$props) $$invalidate(3, media_chars = $$props.media_chars);
    		if ("search_text" in $$props) $$invalidate(0, search_text = $$props.search_text);
    		if ("media" in $$props) $$invalidate(1, media = $$props.media);
    		if ("filter" in $$props) $$invalidate(4, filter = $$props.filter);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*search_text, media*/ 3) {
    			$$invalidate(1, media = search_text != "" ? media : null);
    		}

    		if ($$self.$$.dirty & /*search_text, media*/ 3) {
    			$$invalidate(3, media_chars = search_text != ""
    			? media ? media.data.Media.characters.nodes : []
    			: []);
    		}

    		if ($$self.$$.dirty & /*media*/ 2) {
    			$$invalidate(4, filter = w => {
    				if (!media) return true;
    				return media.data.Media.characters.nodes.find(i => i.id == w.ID) != null;
    			});
    		}
    	};

    	return [
    		search_text,
    		media,
    		LookupMedia,
    		media_chars,
    		filter,
    		input_input_handler,
    		keyup_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class FilterMedia extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {
    			media_chars: 3,
    			search_text: 0,
    			filter: 4
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "FilterMedia",
    			options,
    			id: create_fragment$6.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*media_chars*/ ctx[3] === undefined && !("media_chars" in props)) {
    			console.warn("<FilterMedia> was created without expected prop 'media_chars'");
    		}

    		if (/*filter*/ ctx[4] === undefined && !("filter" in props)) {
    			console.warn("<FilterMedia> was created without expected prop 'filter'");
    		}
    	}

    	get media_chars() {
    		throw new Error("<FilterMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set media_chars(value) {
    		throw new Error("<FilterMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get search_text() {
    		throw new Error("<FilterMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set search_text(value) {
    		throw new Error("<FilterMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get filter() {
    		throw new Error("<FilterMedia>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set filter(value) {
    		throw new Error("<FilterMedia>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/Profile.svelte generated by Svelte v3.38.2 */
    const file$5 = "src/component/Profile.svelte";

    // (4:0) {#if $Inventory}
    function create_if_block$3(ctx) {
    	let div1;
    	let h3;
    	let t0;
    	let t1_value = /*$Inventory*/ ctx[0].ID + "";
    	let t1;
    	let t2;
    	let t3;
    	let div0;
    	let p;
    	let t4_value = /*$Inventory*/ ctx[0].Quote + "";
    	let t4;
    	let if_block = /*$Inventory*/ ctx[0].Favorite && create_if_block_1$1(ctx);

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			h3 = element("h3");
    			t0 = text("User ");
    			t1 = text(t1_value);
    			t2 = space();
    			if (if_block) if_block.c();
    			t3 = space();
    			div0 = element("div");
    			p = element("p");
    			t4 = text(t4_value);
    			attr_dev(h3, "class", "svelte-jrifvk");
    			add_location(h3, file$5, 5, 4, 110);
    			attr_dev(p, "class", "svelte-jrifvk");
    			add_location(p, file$5, 23, 6, 642);
    			attr_dev(div0, "class", "description svelte-jrifvk");
    			add_location(div0, file$5, 22, 4, 610);
    			attr_dev(div1, "class", "content svelte-jrifvk");
    			add_location(div1, file$5, 4, 2, 84);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, h3);
    			append_dev(h3, t0);
    			append_dev(h3, t1);
    			append_dev(div1, t2);
    			if (if_block) if_block.m(div1, null);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div0, p);
    			append_dev(p, t4);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$Inventory*/ 1 && t1_value !== (t1_value = /*$Inventory*/ ctx[0].ID + "")) set_data_dev(t1, t1_value);

    			if (/*$Inventory*/ ctx[0].Favorite) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block_1$1(ctx);
    					if_block.c();
    					if_block.m(div1, t3);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$Inventory*/ 1 && t4_value !== (t4_value = /*$Inventory*/ ctx[0].Quote + "")) set_data_dev(t4, t4_value);
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    			if (if_block) if_block.d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(4:0) {#if $Inventory}",
    		ctx
    	});

    	return block;
    }

    // (7:4) {#if $Inventory.Favorite}
    function create_if_block_1$1(ctx) {
    	let h4;
    	let t1;
    	let div;
    	let a;
    	let h5;
    	let t2_value = /*$Inventory*/ ctx[0].Favorite.Name + "";
    	let t2;
    	let a_href_value;
    	let t3;
    	let p;
    	let t4_value = /*$Inventory*/ ctx[0].Favorite.ID + "";
    	let t4;
    	let t5;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			h4 = element("h4");
    			h4.textContent = "Favorite Character";
    			t1 = space();
    			div = element("div");
    			a = element("a");
    			h5 = element("h5");
    			t2 = text(t2_value);
    			t3 = space();
    			p = element("p");
    			t4 = text(t4_value);
    			t5 = space();
    			img = element("img");
    			attr_dev(h4, "class", "svelte-jrifvk");
    			add_location(h4, file$5, 7, 6, 176);
    			attr_dev(h5, "class", "svelte-jrifvk");
    			add_location(h5, file$5, 12, 10, 367);
    			attr_dev(a, "href", a_href_value = "https://anilist.co/character/" + /*$Inventory*/ ctx[0].Favorite.ID);
    			attr_dev(a, "title", "view on anilist");
    			attr_dev(a, "class", "svelte-jrifvk");
    			add_location(a, file$5, 9, 8, 243);
    			attr_dev(p, "class", "svelte-jrifvk");
    			add_location(p, file$5, 16, 8, 448);
    			if (img.src !== (img_src_value = /*$Inventory*/ ctx[0].Favorite.Image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*$Inventory*/ ctx[0].Favorite.Name);
    			attr_dev(img, "class", "svelte-jrifvk");
    			add_location(img, file$5, 17, 8, 488);
    			attr_dev(div, "class", "waifu-card svelte-jrifvk");
    			add_location(div, file$5, 8, 6, 210);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, h4, anchor);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, h5);
    			append_dev(h5, t2);
    			append_dev(div, t3);
    			append_dev(div, p);
    			append_dev(p, t4);
    			append_dev(div, t5);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$Inventory*/ 1 && t2_value !== (t2_value = /*$Inventory*/ ctx[0].Favorite.Name + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*$Inventory*/ 1 && a_href_value !== (a_href_value = "https://anilist.co/character/" + /*$Inventory*/ ctx[0].Favorite.ID)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if (dirty & /*$Inventory*/ 1 && t4_value !== (t4_value = /*$Inventory*/ ctx[0].Favorite.ID + "")) set_data_dev(t4, t4_value);

    			if (dirty & /*$Inventory*/ 1 && img.src !== (img_src_value = /*$Inventory*/ ctx[0].Favorite.Image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$Inventory*/ 1 && img_alt_value !== (img_alt_value = /*$Inventory*/ ctx[0].Favorite.Name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(h4);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(7:4) {#if $Inventory.Favorite}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let if_block_anchor;
    	let if_block = /*$Inventory*/ ctx[0] && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*$Inventory*/ ctx[0]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $Inventory;
    	validate_store(Inventory, "Inventory");
    	component_subscribe($$self, Inventory, $$value => $$invalidate(0, $Inventory = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Profile", slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Profile> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Inventory, $Inventory });
    	return [$Inventory];
    }

    class Profile extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Profile",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/component/Compare.svelte generated by Svelte v3.38.2 */

    const file$4 = "src/component/Compare.svelte";

    function create_fragment$4(ctx) {
    	let div;
    	let current;
    	const default_slot_template = /*#slots*/ ctx[2].default;
    	const default_slot = create_slot(default_slot_template, ctx, /*$$scope*/ ctx[1], null);

    	const block = {
    		c: function create() {
    			div = element("div");
    			if (default_slot) default_slot.c();
    			attr_dev(div, "class", "svelte-1a0a2md");
    			toggle_class(div, "border", /*compare*/ ctx[0]);
    			add_location(div, file$4, 3, 0, 49);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (default_slot) {
    				default_slot.m(div, null);
    			}

    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (default_slot) {
    				if (default_slot.p && (!current || dirty & /*$$scope*/ 2)) {
    					update_slot(default_slot, default_slot_template, ctx, /*$$scope*/ ctx[1], dirty, null, null);
    				}
    			}

    			if (dirty & /*compare*/ 1) {
    				toggle_class(div, "border", /*compare*/ ctx[0]);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(default_slot, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(default_slot, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if (default_slot) default_slot.d(detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Compare", slots, ['default']);
    	let { compare } = $$props;
    	const writable_props = ["compare"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Compare> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ("compare" in $$props) $$invalidate(0, compare = $$props.compare);
    		if ("$$scope" in $$props) $$invalidate(1, $$scope = $$props.$$scope);
    	};

    	$$self.$capture_state = () => ({ compare });

    	$$self.$inject_state = $$props => {
    		if ("compare" in $$props) $$invalidate(0, compare = $$props.compare);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [compare, $$scope, slots];
    }

    class Compare extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, { compare: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Compare",
    			options,
    			id: create_fragment$4.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*compare*/ ctx[0] === undefined && !("compare" in props)) {
    			console.warn("<Compare> was created without expected prop 'compare'");
    		}
    	}

    	get compare() {
    		throw new Error("<Compare>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set compare(value) {
    		throw new Error("<Compare>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/Missing.svelte generated by Svelte v3.38.2 */
    const file$3 = "src/component/Missing.svelte";

    function get_each_context$1(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[5] = list[i];
    	return child_ctx;
    }

    // (11:0) {#if really_missing}
    function create_if_block$2(ctx) {
    	let each_1_anchor;
    	let current;
    	let each_value = /*really_missing*/ ctx[1];
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	const block = {
    		c: function create() {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			each_1_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(target, anchor);
    			}

    			insert_dev(target, each_1_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*CompareChars, really_missing*/ 3) {
    				each_value = /*really_missing*/ ctx[1];
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context$1(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block$1(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			current = true;
    		},
    		o: function outro(local) {
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_each(each_blocks, detaching);
    			if (detaching) detach_dev(each_1_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(11:0) {#if really_missing}",
    		ctx
    	});

    	return block;
    }

    // (29:6) {:else}
    function create_else_block$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div0, "class", "img-overlay svelte-m6gxn5");
    			add_location(div0, file$3, 30, 10, 877);
    			if (img.src !== (img_src_value = /*w*/ ctx[5].image.large)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*w*/ ctx[5].name.full);
    			attr_dev(img, "class", "svelte-m6gxn5");
    			add_location(img, file$3, 31, 10, 919);
    			attr_dev(div1, "class", "overlay-wrapper svelte-m6gxn5");
    			add_location(div1, file$3, 29, 8, 837);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*really_missing*/ 2 && img.src !== (img_src_value = /*w*/ ctx[5].image.large)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*really_missing*/ 2 && img_alt_value !== (img_alt_value = /*w*/ ctx[5].name.full)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block$1.name,
    		type: "else",
    		source: "(29:6) {:else}",
    		ctx
    	});

    	return block;
    }

    // (22:6) {#if CompareChars}
    function create_if_block_1(ctx) {
    	let compare;
    	let current;

    	function func(...args) {
    		return /*func*/ ctx[4](/*w*/ ctx[5], ...args);
    	}

    	compare = new Compare({
    			props: {
    				compare: /*CompareChars*/ ctx[0].some(func),
    				$$slots: { default: [create_default_slot$1] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(compare.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(compare, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const compare_changes = {};
    			if (dirty & /*CompareChars, really_missing*/ 3) compare_changes.compare = /*CompareChars*/ ctx[0].some(func);

    			if (dirty & /*$$scope, really_missing*/ 258) {
    				compare_changes.$$scope = { dirty, ctx };
    			}

    			compare.$set(compare_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(compare.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(compare.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(compare, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(22:6) {#if CompareChars}",
    		ctx
    	});

    	return block;
    }

    // (23:8) <Compare compare="{CompareChars.some((x) => x.ID === w.id)}">
    function create_default_slot$1(ctx) {
    	let div1;
    	let div0;
    	let t;
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			img = element("img");
    			attr_dev(div0, "class", "img-overlay svelte-m6gxn5");
    			add_location(div0, file$3, 24, 12, 685);
    			if (img.src !== (img_src_value = /*w*/ ctx[5].image.large)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*w*/ ctx[5].name.full);
    			attr_dev(img, "class", "svelte-m6gxn5");
    			add_location(img, file$3, 25, 12, 729);
    			attr_dev(div1, "class", "overlay-wrapper svelte-m6gxn5");
    			add_location(div1, file$3, 23, 10, 643);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, div0);
    			append_dev(div1, t);
    			append_dev(div1, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*really_missing*/ 2 && img.src !== (img_src_value = /*w*/ ctx[5].image.large)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*really_missing*/ 2 && img_alt_value !== (img_alt_value = /*w*/ ctx[5].name.full)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot$1.name,
    		type: "slot",
    		source: "(23:8) <Compare compare=\\\"{CompareChars.some((x) => x.ID === w.id)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (12:2) {#each really_missing as w}
    function create_each_block$1(ctx) {
    	let div;
    	let a;
    	let h4;
    	let t0_value = /*w*/ ctx[5].name.full + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let p;
    	let t2_value = /*w*/ ctx[5].id + "";
    	let t2;
    	let t3;
    	let current_block_type_index;
    	let if_block;
    	let t4;
    	let current;
    	const if_block_creators = [create_if_block_1, create_else_block$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*CompareChars*/ ctx[0]) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			if_block.c();
    			t4 = space();
    			attr_dev(h4, "class", "svelte-m6gxn5");
    			add_location(h4, file$3, 16, 8, 464);
    			attr_dev(a, "href", a_href_value = "https://anilist.co/character/" + /*w*/ ctx[5].id);
    			attr_dev(a, "title", "view on anilist");
    			attr_dev(a, "class", "svelte-m6gxn5");
    			add_location(a, file$3, 13, 6, 364);
    			attr_dev(p, "class", "svelte-m6gxn5");
    			add_location(p, file$3, 20, 6, 524);
    			attr_dev(div, "class", "waifu-card svelte-m6gxn5");
    			add_location(div, file$3, 12, 4, 333);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			if_blocks[current_block_type_index].m(div, null);
    			append_dev(div, t4);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*really_missing*/ 2) && t0_value !== (t0_value = /*w*/ ctx[5].name.full + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*really_missing*/ 2 && a_href_value !== (a_href_value = "https://anilist.co/character/" + /*w*/ ctx[5].id)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*really_missing*/ 2) && t2_value !== (t2_value = /*w*/ ctx[5].id + "")) set_data_dev(t2, t2_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, t4);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block$1.name,
    		type: "each",
    		source: "(12:2) {#each really_missing as w}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let if_block_anchor;
    	let current;
    	let if_block = /*really_missing*/ ctx[1] && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block) if_block.m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*really_missing*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);

    					if (dirty & /*really_missing*/ 2) {
    						transition_in(if_block, 1);
    					}
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				}
    			} else if (if_block) {
    				group_outros();

    				transition_out(if_block, 1, 1, () => {
    					if_block = null;
    				});

    				check_outros();
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block) if_block.d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props, $$invalidate) {
    	let $Inventory;
    	validate_store(Inventory, "Inventory");
    	component_subscribe($$self, Inventory, $$value => $$invalidate(3, $Inventory = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("Missing", slots, []);
    	
    	
    	let { missing = [] } = $$props;
    	let really_missing = [];
    	let { CompareChars = [] } = $$props;
    	const writable_props = ["missing", "CompareChars"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Missing> was created with unknown prop '${key}'`);
    	});

    	const func = (w, x) => x.ID === w.id;

    	$$self.$$set = $$props => {
    		if ("missing" in $$props) $$invalidate(2, missing = $$props.missing);
    		if ("CompareChars" in $$props) $$invalidate(0, CompareChars = $$props.CompareChars);
    	};

    	$$self.$capture_state = () => ({
    		Inventory,
    		Compare,
    		missing,
    		really_missing,
    		CompareChars,
    		$Inventory
    	});

    	$$self.$inject_state = $$props => {
    		if ("missing" in $$props) $$invalidate(2, missing = $$props.missing);
    		if ("really_missing" in $$props) $$invalidate(1, really_missing = $$props.really_missing);
    		if ("CompareChars" in $$props) $$invalidate(0, CompareChars = $$props.CompareChars);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*missing, $Inventory*/ 12) {
    			$$invalidate(1, really_missing = missing.filter(w => !$Inventory.Waifus.some(x => x.ID == w.id)));
    		}
    	};

    	return [CompareChars, really_missing, missing, $Inventory, func];
    }

    class Missing extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { missing: 2, CompareChars: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Missing",
    			options,
    			id: create_fragment$3.name
    		});
    	}

    	get missing() {
    		throw new Error("<Missing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set missing(value) {
    		throw new Error("<Missing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get CompareChars() {
    		throw new Error("<Missing>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set CompareChars(value) {
    		throw new Error("<Missing>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/component/CompareUser.svelte generated by Svelte v3.38.2 */
    const file$2 = "src/component/CompareUser.svelte";

    // (26:2) {#if user}
    function create_if_block$1(ctx) {
    	let button;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			button = element("button");
    			button.textContent = "x";
    			attr_dev(button, "class", "svelte-1ng652");
    			add_location(button, file$2, 26, 4, 1134);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, button, anchor);

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler_1*/ ctx[5], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(button);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(26:2) {#if user}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$2(ctx) {
    	let label;
    	let t0;
    	let input;
    	let t1;
    	let button;
    	let t3;
    	let mounted;
    	let dispose;
    	let if_block = /*user*/ ctx[1] && create_if_block$1(ctx);

    	const block = {
    		c: function create() {
    			label = element("label");
    			t0 = text("User\n  ");
    			input = element("input");
    			t1 = space();
    			button = element("button");
    			button.textContent = "Search";
    			t3 = space();
    			if (if_block) if_block.c();
    			attr_dev(input, "type", "text");
    			attr_dev(input, "placeholder", "206794847581896705");
    			attr_dev(input, "class", "svelte-1ng652");
    			add_location(input, file$2, 23, 2, 980);
    			attr_dev(button, "class", "svelte-1ng652");
    			add_location(button, file$2, 24, 2, 1057);
    			attr_dev(label, "class", "svelte-1ng652");
    			add_location(label, file$2, 21, 0, 963);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, label, anchor);
    			append_dev(label, t0);
    			append_dev(label, input);
    			set_input_value(input, /*user*/ ctx[1]);
    			append_dev(label, t1);
    			append_dev(label, button);
    			append_dev(label, t3);
    			if (if_block) if_block.m(label, null);

    			if (!mounted) {
    				dispose = [
    					listen_dev(input, "input", /*input_input_handler*/ ctx[3]),
    					listen_dev(button, "click", /*click_handler*/ ctx[4], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*user*/ 2 && input.value !== /*user*/ ctx[1]) {
    				set_input_value(input, /*user*/ ctx[1]);
    			}

    			if (/*user*/ ctx[1]) {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$1(ctx);
    					if_block.c();
    					if_block.m(label, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(label);
    			if (if_block) if_block.d();
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let user;
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("CompareUser", slots, []);

    	var __awaiter = this && this.__awaiter || function (thisArg, _arguments, P, generator) {
    		function adopt(value) {
    			return value instanceof P
    			? value
    			: new P(function (resolve) {
    						resolve(value);
    					});
    		}

    		return new (P || (P = Promise))(function (resolve, reject) {
    				function fulfilled(value) {
    					try {
    						step(generator.next(value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function rejected(value) {
    					try {
    						step(generator["throw"](value));
    					} catch(e) {
    						reject(e);
    					}
    				}

    				function step(result) {
    					result.done
    					? resolve(result.value)
    					: adopt(result.value).then(fulfilled, rejected);
    				}

    				step((generator = generator.apply(thisArg, _arguments || [])).next());
    			});
    	};

    	
    	let { CompareChars = [] } = $$props;

    	function LookupUser(user) {
    		return __awaiter(this, void 0, void 0, function* () {
    			let u = new User();
    			$$invalidate(0, CompareChars = yield u.pullInventory(user));
    		});
    	}

    	const writable_props = ["CompareChars"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<CompareUser> was created with unknown prop '${key}'`);
    	});

    	function input_input_handler() {
    		user = this.value;
    		$$invalidate(1, user);
    	}

    	const click_handler = () => LookupUser(user);

    	const click_handler_1 = () => {
    		$$invalidate(0, CompareChars = []);
    		$$invalidate(1, user = "");
    	};

    	$$self.$$set = $$props => {
    		if ("CompareChars" in $$props) $$invalidate(0, CompareChars = $$props.CompareChars);
    	};

    	$$self.$capture_state = () => ({
    		__awaiter,
    		User,
    		CompareChars,
    		LookupUser,
    		user
    	});

    	$$self.$inject_state = $$props => {
    		if ("__awaiter" in $$props) __awaiter = $$props.__awaiter;
    		if ("CompareChars" in $$props) $$invalidate(0, CompareChars = $$props.CompareChars);
    		if ("user" in $$props) $$invalidate(1, user = $$props.user);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$invalidate(1, user = "");

    	return [
    		CompareChars,
    		user,
    		LookupUser,
    		input_input_handler,
    		click_handler,
    		click_handler_1
    	];
    }

    class CompareUser extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, { CompareChars: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "CompareUser",
    			options,
    			id: create_fragment$2.name
    		});
    	}

    	get CompareChars() {
    		throw new Error("<CompareUser>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set CompareChars(value) {
    		throw new Error("<CompareUser>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/routes/List.svelte generated by Svelte v3.38.2 */
    const file$1 = "src/routes/List.svelte";

    function get_each_context(ctx, list, i) {
    	const child_ctx = ctx.slice();
    	child_ctx[15] = list[i];
    	return child_ctx;
    }

    // (1:0) <script lang="ts">; import { push }
    function create_catch_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_catch_block.name,
    		type: "catch",
    		source: "(1:0) <script lang=\\\"ts\\\">; import { push }",
    		ctx
    	});

    	return block;
    }

    // (35:55)      <div class="nav" id="nav">       <div class="back-btn pl">         <button           on:click="{() => {             push('/');           }}
    function create_then_block(ctx) {
    	let div5;
    	let div0;
    	let button;
    	let t1;
    	let div4;
    	let div1;
    	let compareuser;
    	let updating_CompareChars;
    	let t2;
    	let div2;
    	let filterchar;
    	let updating_filter;
    	let t3;
    	let div3;
    	let filtermedia;
    	let updating_filter_1;
    	let updating_media_chars;
    	let t4;
    	let div8;
    	let div7;
    	let div6;
    	let profile;
    	let t5;
    	let t6;
    	let missing;
    	let updating_CompareChars_1;
    	let t7;
    	let h4;
    	let current;
    	let mounted;
    	let dispose;

    	function compareuser_CompareChars_binding(value) {
    		/*compareuser_CompareChars_binding*/ ctx[7](value);
    	}

    	let compareuser_props = {};

    	if (/*compare_chars*/ ctx[3] !== void 0) {
    		compareuser_props.CompareChars = /*compare_chars*/ ctx[3];
    	}

    	compareuser = new CompareUser({ props: compareuser_props, $$inline: true });
    	binding_callbacks.push(() => bind(compareuser, "CompareChars", compareuser_CompareChars_binding));

    	function filterchar_filter_binding(value) {
    		/*filterchar_filter_binding*/ ctx[8](value);
    	}

    	let filterchar_props = {};

    	if (/*filters*/ ctx[1][0] !== void 0) {
    		filterchar_props.filter = /*filters*/ ctx[1][0];
    	}

    	filterchar = new FilterChar({ props: filterchar_props, $$inline: true });
    	binding_callbacks.push(() => bind(filterchar, "filter", filterchar_filter_binding));

    	function filtermedia_filter_binding(value) {
    		/*filtermedia_filter_binding*/ ctx[9](value);
    	}

    	function filtermedia_media_chars_binding(value) {
    		/*filtermedia_media_chars_binding*/ ctx[10](value);
    	}

    	let filtermedia_props = {};

    	if (/*filters*/ ctx[1][1] !== void 0) {
    		filtermedia_props.filter = /*filters*/ ctx[1][1];
    	}

    	if (/*media_chars*/ ctx[2] !== void 0) {
    		filtermedia_props.media_chars = /*media_chars*/ ctx[2];
    	}

    	filtermedia = new FilterMedia({ props: filtermedia_props, $$inline: true });
    	binding_callbacks.push(() => bind(filtermedia, "filter", filtermedia_filter_binding));
    	binding_callbacks.push(() => bind(filtermedia, "media_chars", filtermedia_media_chars_binding));
    	profile = new Profile({ $$inline: true });
    	let each_value = /*i*/ ctx[14].filter(/*func*/ ctx[11]).splice(0, 200);
    	validate_each_argument(each_value);
    	let each_blocks = [];

    	for (let i = 0; i < each_value.length; i += 1) {
    		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    	}

    	const out = i => transition_out(each_blocks[i], 1, 1, () => {
    		each_blocks[i] = null;
    	});

    	function missing_CompareChars_binding(value) {
    		/*missing_CompareChars_binding*/ ctx[13](value);
    	}

    	let missing_props = { missing: /*media_chars*/ ctx[2] };

    	if (/*compare_chars*/ ctx[3] !== void 0) {
    		missing_props.CompareChars = /*compare_chars*/ ctx[3];
    	}

    	missing = new Missing({ props: missing_props, $$inline: true });
    	binding_callbacks.push(() => bind(missing, "CompareChars", missing_CompareChars_binding));

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			button = element("button");
    			button.textContent = "Back";
    			t1 = space();
    			div4 = element("div");
    			div1 = element("div");
    			create_component(compareuser.$$.fragment);
    			t2 = space();
    			div2 = element("div");
    			create_component(filterchar.$$.fragment);
    			t3 = space();
    			div3 = element("div");
    			create_component(filtermedia.$$.fragment);
    			t4 = space();
    			div8 = element("div");
    			div7 = element("div");
    			div6 = element("div");
    			create_component(profile.$$.fragment);
    			t5 = space();

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].c();
    			}

    			t6 = space();
    			create_component(missing.$$.fragment);
    			t7 = space();
    			h4 = element("h4");
    			h4.textContent = "Search to list more...";
    			attr_dev(button, "class", "svelte-m7ujio");
    			add_location(button, file$1, 37, 8, 1214);
    			attr_dev(div0, "class", "back-btn pl svelte-m7ujio");
    			add_location(div0, file$1, 36, 6, 1180);
    			attr_dev(div1, "class", "search-prop svelte-m7ujio");
    			add_location(div1, file$1, 43, 8, 1353);
    			attr_dev(div2, "class", "search-prop svelte-m7ujio");
    			add_location(div2, file$1, 46, 8, 1464);
    			attr_dev(div3, "class", "search-prop svelte-m7ujio");
    			add_location(div3, file$1, 49, 8, 1565);
    			attr_dev(div4, "class", "search pl svelte-m7ujio");
    			add_location(div4, file$1, 42, 6, 1321);
    			attr_dev(div5, "class", "nav svelte-m7ujio");
    			attr_dev(div5, "id", "nav");
    			add_location(div5, file$1, 35, 4, 1147);
    			attr_dev(div6, "class", "left svelte-m7ujio");
    			attr_dev(div6, "id", "profile");
    			add_location(div6, file$1, 56, 8, 1774);
    			attr_dev(h4, "class", "search-more svelte-m7ujio");
    			add_location(h4, file$1, 79, 8, 2583);
    			attr_dev(div7, "class", "container svelte-m7ujio");
    			add_location(div7, file$1, 55, 6, 1742);
    			attr_dev(div8, "class", "container-wrapper svelte-m7ujio");
    			add_location(div8, file$1, 54, 4, 1704);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div0, button);
    			append_dev(div5, t1);
    			append_dev(div5, div4);
    			append_dev(div4, div1);
    			mount_component(compareuser, div1, null);
    			append_dev(div4, t2);
    			append_dev(div4, div2);
    			mount_component(filterchar, div2, null);
    			append_dev(div4, t3);
    			append_dev(div4, div3);
    			mount_component(filtermedia, div3, null);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, div8, anchor);
    			append_dev(div8, div7);
    			append_dev(div7, div6);
    			mount_component(profile, div6, null);
    			append_dev(div7, t5);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				each_blocks[i].m(div7, null);
    			}

    			append_dev(div7, t6);
    			mount_component(missing, div7, null);
    			append_dev(div7, t7);
    			append_dev(div7, h4);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(button, "click", /*click_handler*/ ctx[6], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			const compareuser_changes = {};

    			if (!updating_CompareChars && dirty & /*compare_chars*/ 8) {
    				updating_CompareChars = true;
    				compareuser_changes.CompareChars = /*compare_chars*/ ctx[3];
    				add_flush_callback(() => updating_CompareChars = false);
    			}

    			compareuser.$set(compareuser_changes);
    			const filterchar_changes = {};

    			if (!updating_filter && dirty & /*filters*/ 2) {
    				updating_filter = true;
    				filterchar_changes.filter = /*filters*/ ctx[1][0];
    				add_flush_callback(() => updating_filter = false);
    			}

    			filterchar.$set(filterchar_changes);
    			const filtermedia_changes = {};

    			if (!updating_filter_1 && dirty & /*filters*/ 2) {
    				updating_filter_1 = true;
    				filtermedia_changes.filter = /*filters*/ ctx[1][1];
    				add_flush_callback(() => updating_filter_1 = false);
    			}

    			if (!updating_media_chars && dirty & /*media_chars*/ 4) {
    				updating_media_chars = true;
    				filtermedia_changes.media_chars = /*media_chars*/ ctx[2];
    				add_flush_callback(() => updating_media_chars = false);
    			}

    			filtermedia.$set(filtermedia_changes);

    			if (dirty & /*compare_chars, $Inventory, params, filter_all, undefined*/ 57) {
    				each_value = /*i*/ ctx[14].filter(/*func*/ ctx[11]).splice(0, 200);
    				validate_each_argument(each_value);
    				let i;

    				for (i = 0; i < each_value.length; i += 1) {
    					const child_ctx = get_each_context(ctx, each_value, i);

    					if (each_blocks[i]) {
    						each_blocks[i].p(child_ctx, dirty);
    						transition_in(each_blocks[i], 1);
    					} else {
    						each_blocks[i] = create_each_block(child_ctx);
    						each_blocks[i].c();
    						transition_in(each_blocks[i], 1);
    						each_blocks[i].m(div7, t6);
    					}
    				}

    				group_outros();

    				for (i = each_value.length; i < each_blocks.length; i += 1) {
    					out(i);
    				}

    				check_outros();
    			}

    			const missing_changes = {};
    			if (dirty & /*media_chars*/ 4) missing_changes.missing = /*media_chars*/ ctx[2];

    			if (!updating_CompareChars_1 && dirty & /*compare_chars*/ 8) {
    				updating_CompareChars_1 = true;
    				missing_changes.CompareChars = /*compare_chars*/ ctx[3];
    				add_flush_callback(() => updating_CompareChars_1 = false);
    			}

    			missing.$set(missing_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(compareuser.$$.fragment, local);
    			transition_in(filterchar.$$.fragment, local);
    			transition_in(filtermedia.$$.fragment, local);
    			transition_in(profile.$$.fragment, local);

    			for (let i = 0; i < each_value.length; i += 1) {
    				transition_in(each_blocks[i]);
    			}

    			transition_in(missing.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(compareuser.$$.fragment, local);
    			transition_out(filterchar.$$.fragment, local);
    			transition_out(filtermedia.$$.fragment, local);
    			transition_out(profile.$$.fragment, local);
    			each_blocks = each_blocks.filter(Boolean);

    			for (let i = 0; i < each_blocks.length; i += 1) {
    				transition_out(each_blocks[i]);
    			}

    			transition_out(missing.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			destroy_component(compareuser);
    			destroy_component(filterchar);
    			destroy_component(filtermedia);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(div8);
    			destroy_component(profile);
    			destroy_each(each_blocks, detaching);
    			destroy_component(missing);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_then_block.name,
    		type: "then",
    		source: "(35:55)      <div class=\\\"nav\\\" id=\\\"nav\\\">       <div class=\\\"back-btn pl\\\">         <button           on:click=\\\"{() => {             push('/');           }}",
    		ctx
    	});

    	return block;
    }

    // (74:12) {:else}
    function create_else_block(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*w*/ ctx[15].Image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*w*/ ctx[15].Name);
    			attr_dev(img, "class", "svelte-m7ujio");
    			add_location(img, file$1, 74, 14, 2405);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$Inventory, params, filter_all*/ 49 && img.src !== (img_src_value = /*w*/ ctx[15].Image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$Inventory, params, filter_all*/ 49 && img_alt_value !== (img_alt_value = /*w*/ ctx[15].Name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(74:12) {:else}",
    		ctx
    	});

    	return block;
    }

    // (70:12) {#if compare_chars !== undefined}
    function create_if_block(ctx) {
    	let compare;
    	let current;

    	function func_1(...args) {
    		return /*func_1*/ ctx[12](/*w*/ ctx[15], ...args);
    	}

    	compare = new Compare({
    			props: {
    				compare: /*compare_chars*/ ctx[3].some(func_1),
    				$$slots: { default: [create_default_slot] },
    				$$scope: { ctx }
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(compare.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(compare, target, anchor);
    			current = true;
    		},
    		p: function update(new_ctx, dirty) {
    			ctx = new_ctx;
    			const compare_changes = {};
    			if (dirty & /*compare_chars, $Inventory, params, filter_all*/ 57) compare_changes.compare = /*compare_chars*/ ctx[3].some(func_1);

    			if (dirty & /*$$scope, $Inventory, params, filter_all*/ 262193) {
    				compare_changes.$$scope = { dirty, ctx };
    			}

    			compare.$set(compare_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(compare.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(compare.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(compare, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(70:12) {#if compare_chars !== undefined}",
    		ctx
    	});

    	return block;
    }

    // (71:14) <Compare compare="{compare_chars.some((x) => x.ID === w.ID)}">
    function create_default_slot(ctx) {
    	let img;
    	let img_src_value;
    	let img_alt_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			if (img.src !== (img_src_value = /*w*/ ctx[15].Image)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = /*w*/ ctx[15].Name);
    			attr_dev(img, "class", "svelte-m7ujio");
    			add_location(img, file$1, 71, 16, 2307);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$Inventory, params, filter_all*/ 49 && img.src !== (img_src_value = /*w*/ ctx[15].Image)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*$Inventory, params, filter_all*/ 49 && img_alt_value !== (img_alt_value = /*w*/ ctx[15].Name)) {
    				attr_dev(img, "alt", img_alt_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_default_slot.name,
    		type: "slot",
    		source: "(71:14) <Compare compare=\\\"{compare_chars.some((x) => x.ID === w.ID)}\\\">",
    		ctx
    	});

    	return block;
    }

    // (60:8) {#each i.filter((w) => filter_all(w)).splice(0, 200) as w}
    function create_each_block(ctx) {
    	let div;
    	let a;
    	let h4;
    	let t0_value = /*w*/ ctx[15].Name + "";
    	let t0;
    	let a_href_value;
    	let t1;
    	let p;
    	let t2_value = /*w*/ ctx[15].ID + "";
    	let t2;
    	let t3;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	const if_block_creators = [create_if_block, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*compare_chars*/ ctx[3] !== undefined) return 0;
    		return 1;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			div = element("div");
    			a = element("a");
    			h4 = element("h4");
    			t0 = text(t0_value);
    			t1 = space();
    			p = element("p");
    			t2 = text(t2_value);
    			t3 = space();
    			if_block.c();
    			attr_dev(h4, "class", "svelte-m7ujio");
    			add_location(h4, file$1, 64, 14, 2075);
    			attr_dev(a, "href", a_href_value = "https://anilist.co/character/" + /*w*/ ctx[15].ID);
    			attr_dev(a, "title", "view on anilist");
    			attr_dev(a, "class", "svelte-m7ujio");
    			add_location(a, file$1, 61, 12, 1957);
    			attr_dev(p, "class", "svelte-m7ujio");
    			add_location(p, file$1, 68, 12, 2154);
    			attr_dev(div, "class", "waifu-card svelte-m7ujio");
    			add_location(div, file$1, 60, 10, 1920);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, a);
    			append_dev(a, h4);
    			append_dev(h4, t0);
    			append_dev(div, t1);
    			append_dev(div, p);
    			append_dev(p, t2);
    			append_dev(div, t3);
    			if_blocks[current_block_type_index].m(div, null);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			if ((!current || dirty & /*$Inventory, params, filter_all*/ 49) && t0_value !== (t0_value = /*w*/ ctx[15].Name + "")) set_data_dev(t0, t0_value);

    			if (!current || dirty & /*$Inventory, params, filter_all*/ 49 && a_href_value !== (a_href_value = "https://anilist.co/character/" + /*w*/ ctx[15].ID)) {
    				attr_dev(a, "href", a_href_value);
    			}

    			if ((!current || dirty & /*$Inventory, params, filter_all*/ 49) && t2_value !== (t2_value = /*w*/ ctx[15].ID + "")) set_data_dev(t2, t2_value);
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
    				}

    				transition_in(if_block, 1);
    				if_block.m(div, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			if_blocks[current_block_type_index].d();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_each_block.name,
    		type: "each",
    		source: "(60:8) {#each i.filter((w) => filter_all(w)).splice(0, 200) as w}",
    		ctx
    	});

    	return block;
    }

    // (1:0) <script lang="ts">; import { push }
    function create_pending_block(ctx) {
    	const block = {
    		c: noop,
    		m: noop,
    		p: noop,
    		i: noop,
    		o: noop,
    		d: noop
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_pending_block.name,
    		type: "pending",
    		source: "(1:0) <script lang=\\\"ts\\\">; import { push }",
    		ctx
    	});

    	return block;
    }

    function create_fragment$1(ctx) {
    	let meta0;
    	let meta1;
    	let meta1_content_value;
    	let meta2;
    	let meta2_content_value;
    	let meta3;
    	let meta3_content_value;
    	let meta4;
    	let t;
    	let main;
    	let promise;
    	let current;

    	let info = {
    		ctx,
    		current: null,
    		token: null,
    		hasCatch: false,
    		pending: create_pending_block,
    		then: create_then_block,
    		catch: create_catch_block,
    		value: 14,
    		blocks: [,,,]
    	};

    	handle_promise(promise = /*$Inventory*/ ctx[5].pullInventory(/*params*/ ctx[0].user), info);

    	const block = {
    		c: function create() {
    			meta0 = element("meta");
    			meta1 = element("meta");
    			meta2 = element("meta");
    			meta3 = element("meta");
    			meta4 = element("meta");
    			t = space();
    			main = element("main");
    			info.block.c();
    			attr_dev(meta0, "property", "og:type");
    			attr_dev(meta0, "content", "WaifuGUI");
    			add_location(meta0, file$1, 20, 2, 652);
    			attr_dev(meta1, "property", "og:url");
    			attr_dev(meta1, "content", meta1_content_value = "https://waifugui.kar.moe/#/list/" + /*params*/ ctx[0].user);
    			add_location(meta1, file$1, 21, 2, 701);
    			attr_dev(meta2, "property", "og:title");
    			attr_dev(meta2, "content", meta2_content_value = `WaifuGUI | Check out ${/*params*/ ctx[0].user}'s list`);
    			add_location(meta2, file$1, 24, 2, 799);
    			attr_dev(meta3, "property", "og:description");
    			attr_dev(meta3, "content", meta3_content_value = `View ${/*params*/ ctx[0].user}'s list online`);
    			add_location(meta3, file$1, 27, 2, 895);
    			attr_dev(meta4, "property", "og:image");
    			attr_dev(meta4, "content", "https://waifugui.kar.moe/favicon.png");
    			add_location(meta4, file$1, 30, 2, 988);
    			attr_dev(main, "class", "svelte-m7ujio");
    			add_location(main, file$1, 33, 0, 1080);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta0);
    			append_dev(document.head, meta1);
    			append_dev(document.head, meta2);
    			append_dev(document.head, meta3);
    			append_dev(document.head, meta4);
    			insert_dev(target, t, anchor);
    			insert_dev(target, main, anchor);
    			info.block.m(main, info.anchor = null);
    			info.mount = () => main;
    			info.anchor = null;
    			current = true;
    		},
    		p: function update(new_ctx, [dirty]) {
    			ctx = new_ctx;

    			if (!current || dirty & /*params*/ 1 && meta1_content_value !== (meta1_content_value = "https://waifugui.kar.moe/#/list/" + /*params*/ ctx[0].user)) {
    				attr_dev(meta1, "content", meta1_content_value);
    			}

    			if (!current || dirty & /*params*/ 1 && meta2_content_value !== (meta2_content_value = `WaifuGUI | Check out ${/*params*/ ctx[0].user}'s list`)) {
    				attr_dev(meta2, "content", meta2_content_value);
    			}

    			if (!current || dirty & /*params*/ 1 && meta3_content_value !== (meta3_content_value = `View ${/*params*/ ctx[0].user}'s list online`)) {
    				attr_dev(meta3, "content", meta3_content_value);
    			}

    			info.ctx = ctx;

    			if (dirty & /*$Inventory, params*/ 33 && promise !== (promise = /*$Inventory*/ ctx[5].pullInventory(/*params*/ ctx[0].user)) && handle_promise(promise, info)) ; else {
    				update_await_block_branch(info, ctx, dirty);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(info.block);
    			current = true;
    		},
    		o: function outro(local) {
    			for (let i = 0; i < 3; i += 1) {
    				const block = info.blocks[i];
    				transition_out(block);
    			}

    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta0);
    			detach_dev(meta1);
    			detach_dev(meta2);
    			detach_dev(meta3);
    			detach_dev(meta4);
    			if (detaching) detach_dev(t);
    			if (detaching) detach_dev(main);
    			info.block.d();
    			info.token = null;
    			info = null;
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let filters;
    	let filter_all;
    	let $Inventory;
    	validate_store(Inventory, "Inventory");
    	component_subscribe($$self, Inventory, $$value => $$invalidate(5, $Inventory = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("List", slots, []);
    	
    	
    	let { params } = $$props;
    	let media_chars;
    	let compare_chars = [];
    	const writable_props = ["params"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<List> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		push("/");
    	};

    	function compareuser_CompareChars_binding(value) {
    		compare_chars = value;
    		$$invalidate(3, compare_chars);
    	}

    	function filterchar_filter_binding(value) {
    		if ($$self.$$.not_equal(filters[0], value)) {
    			filters[0] = value;
    			$$invalidate(1, filters);
    		}
    	}

    	function filtermedia_filter_binding(value) {
    		if ($$self.$$.not_equal(filters[1], value)) {
    			filters[1] = value;
    			$$invalidate(1, filters);
    		}
    	}

    	function filtermedia_media_chars_binding(value) {
    		media_chars = value;
    		$$invalidate(2, media_chars);
    	}

    	const func = w => filter_all(w);
    	const func_1 = (w, x) => x.ID === w.ID;

    	function missing_CompareChars_binding(value) {
    		compare_chars = value;
    		$$invalidate(3, compare_chars);
    	}

    	$$self.$$set = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    	};

    	$$self.$capture_state = () => ({
    		push,
    		Inventory,
    		User,
    		FilterChar,
    		FilterMedia,
    		Profile,
    		Missing,
    		Compare,
    		CompareUser,
    		params,
    		media_chars,
    		compare_chars,
    		filters,
    		filter_all,
    		$Inventory
    	});

    	$$self.$inject_state = $$props => {
    		if ("params" in $$props) $$invalidate(0, params = $$props.params);
    		if ("media_chars" in $$props) $$invalidate(2, media_chars = $$props.media_chars);
    		if ("compare_chars" in $$props) $$invalidate(3, compare_chars = $$props.compare_chars);
    		if ("filters" in $$props) $$invalidate(1, filters = $$props.filters);
    		if ("filter_all" in $$props) $$invalidate(4, filter_all = $$props.filter_all);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*filters*/ 2) {
    			$$invalidate(4, filter_all = w => {
    				return filters.map(f => f(w)).every(v => v != false);
    			});
    		}
    	};

    	$$invalidate(1, filters = [_ => true, _ => true]);

    	return [
    		params,
    		filters,
    		media_chars,
    		compare_chars,
    		filter_all,
    		$Inventory,
    		click_handler,
    		compareuser_CompareChars_binding,
    		filterchar_filter_binding,
    		filtermedia_filter_binding,
    		filtermedia_media_chars_binding,
    		func,
    		func_1,
    		missing_CompareChars_binding
    	];
    }

    class List extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, { params: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "List",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*params*/ ctx[0] === undefined && !("params" in props)) {
    			console.warn("<List> was created without expected prop 'params'");
    		}
    	}

    	get params() {
    		throw new Error("<List>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set params(value) {
    		throw new Error("<List>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* src/App.svelte generated by Svelte v3.38.2 */
    const file = "src/App.svelte";

    function create_fragment(ctx) {
    	let meta;
    	let t;
    	let router;
    	let current;

    	router = new Router({
    			props: { routes: /*routes*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			meta = element("meta");
    			t = space();
    			create_component(router.$$.fragment);
    			attr_dev(meta, "property", "og:site_name");
    			attr_dev(meta, "content", "WaifuGUI");
    			add_location(meta, file, 10, 2, 234);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			append_dev(document.head, meta);
    			insert_dev(target, t, anchor);
    			mount_component(router, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(router.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(router.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			detach_dev(meta);
    			if (detaching) detach_dev(t);
    			destroy_component(router, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots("App", slots, []);
    	const routes = { "/": Home, "/list/:user": List };
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({ Router, Home, List, routes });
    	return [routes];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { routes: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}

    	get routes() {
    		return this.$$.ctx[0];
    	}

    	set routes(value) {
    		throw new Error("<App>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    const app = new App({
        target: document.body,
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
