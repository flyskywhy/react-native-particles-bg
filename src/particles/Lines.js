import React from "react";
import Proton from "proton-engine";
import RAFManager from "raf-manager";
import Canvas from "./Canvas";
import { getColor } from "../utils/Color";

export default class Lines extends React.Component {
  constructor(props) {
    super(props);
    this.renderProton = this.renderProton.bind(this);
  }

  onCanvasDidMount(canvas){
    if(this.props.color){
      canvas.style.backgroundColor = this.props.color;
    }
  }

  componentWillUnmount() {
    try {
      RAFManager.remove(this.renderProton);
      this.proton.destroy();
    } catch (e) { }
  }

  onCanvasInited(canvas, width, height) {
    this.createProton(canvas, width, height);
    RAFManager.add(this.renderProton);
  }

  onResize(width, height) {
    this.crossZoneBehaviour.zone.width = width;
    this.crossZoneBehaviour.zone.height = height;
    this.proton.renderers[0].resize(width, height);
  }

  createProton(canvas, width, height) {
    this.proton = new Proton();

    const emitter = new Proton.Emitter();
    emitter.damping = 0.008;
    emitter.rate = new Proton.Rate(this.props.num ? this.props.num : 250);
    emitter.addInitialize(new Proton.Mass(1));
    emitter.addInitialize(new Proton.Radius(4));
    emitter.addInitialize(
      new Proton.Velocity(
        new Proton.Span(1.5),
        new Proton.Span(0, 360),
        "polar"
      )
    );
    const mouseObj = {
      x: width / 2,
      y: height / 2
    };

    const attractionBehaviour = new Proton.Attraction(mouseObj, 0, 0);
    const crossZoneBehaviour = new Proton.CrossZone(
      new Proton.RectZone(0, 0, canvas.width, canvas.height),
      "cross"
    );
    emitter.addBehaviour(new Proton.Color("random"));
    emitter.addBehaviour(attractionBehaviour, crossZoneBehaviour);
    emitter.addBehaviour(new Proton.RandomDrift(10, 10, 0.05));
    emitter.p.x = canvas.width / 2;
    emitter.p.y = canvas.height / 2;
    emitter.emit("once");

    this.proton.addEmitter(emitter);
    this.proton.addRenderer(this.createRenderer(canvas));
    this.crossZoneBehaviour = crossZoneBehaviour;
  }

  createRenderer(canvas) {
    const context = canvas.getContext("2d");
    const renderer = new Proton.CanvasRenderer(canvas);
    renderer.onProtonUpdate = () => {
      context.fillStyle = getColor(this.props.color, 0.02) || "rgba(0, 0, 0, 0.02)";
      context.fillRect(0, 0, canvas.width, canvas.height);
    };

    renderer.onParticleUpdate = function (particle) {
      context.beginPath();
      context.strokeStyle = particle.color;
      context.lineWidth = 1;
      context.moveTo(particle.old.p.x, particle.old.p.y);
      context.lineTo(particle.p.x, particle.p.y);
      context.closePath();
      context.stroke();
    };

    return renderer;
  }

  renderProton() {
    this.proton && this.proton.update();
  }

  render() {
    return (
      <Canvas bg={this.props.bg}
        globalCompositeOperation="darker"
        onCanvasDidMount={this.onCanvasDidMount.bind(this)}
        onCanvasInited={this.onCanvasInited.bind(this)}
        onResize={this.onResize.bind(this)}
      />
    );
  }
}
