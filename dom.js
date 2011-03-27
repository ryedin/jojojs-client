(function() {
	
	jojo.ns("jojo.event");
	
	/**
   * domEventCache allows a local caching policy for DOM event handlers ----------------------------------------------------------------------
   */
  jojo.event.domEventCache = Class.create({
    /**
     * Initializes the event cache for handlers
     */
    initialize: function() {
      // public properties
      this.observers = [];
    },
    /**
     * Attaches an event handler to a DOM element
     * @param {Object} element  Element on which to observe event
     * @param {String} name Event name
     * @param {Function/Object} observer    Function to call when event is triggered
     * @return {Object} Details on the observer
     */
    bind: function(element, name, observer) {
      if (typeof observer != "function") {
        if (!observer.id || !observer.fn) {
          throw new Error("If the observer object is not a function, it must have both an 'id' (string) and 'fn' (function) property.");
        }
        if (this.observers.any(function(o) {
          return o.id && o.id == observer.id;
        })) {
          throw new Error("Cannot register two DOM event observer objects with the same id.");
        }
      }
      var me = this;
      var observerObject = {
        element:    $(element),
        name:        name,
        observer:    observer,
        unbind: function() {
          me.unbind(observerObject);
        }
      };
      this.observers.push(observerObject);
      observerObject.element.bind(name, observer.fn || observer);
      return observerObject;
    },
    
    /**
     * Detach an event handler from a DOM element
     */
    unbind: function(observerObject) {
      if (this.observers.find(function(obs) {
            return obs === observerObject;
          })) {
                  
        try { 
          observerObject.element.unbind(observerObject.name, observerObject.observer.fn || observerObject.observer); 
        } catch(ex) {
            
        }
        //send to back of execution stack (this patches unbindAll)
        var me = this;
        setTimeout(function() {
          if (me.observers) {
            me.observers = me.observers.reject(function(obs) {
              return obs === observerObject;
            });
          }                
          observerObject = null;    
        }, 1);
      }
    },
    
    /**
     * Detach an event handler from a DOM element, using an ID
     * @param {String} id   ID reference to observer details
     */
    unbindById: function(id) {
      var observer = this.observers.find(function(o) {
        return o.id && o.id == id;
      });
      if (observer) {
        this.unbind(observer);
      }
    },
    /**
     * Detach all event handlers
     */
    unbindAll: function() {
      var me = this;
      this.observers.each(function(obs) {
        me.unbind(obs);
      });
    },    
    // IDisposable
    dispose: function() {
      this.unbindAll();
      this.observers = null;
    }
  });
	
})();
