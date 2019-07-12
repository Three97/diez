import Foundation
import UIKit

@objc(DEZBindings)
public final class Bindings: NSObject, StateBag {
    @objc public internal(set) var image: Image
    @objc public internal(set) var lottie: Lottie
    @objc public internal(set) var typograph: Typograph
    @objc public internal(set) var linearGradient: LinearGradient
    @objc public internal(set) var point: Point2D

    convenience public override init() {
        self.init(
            image: Image(file: File(src: "assets/image%20with%20spaces.jpg", type: "image"), file2x: File(src: "assets/image%20with%20spaces@2x.jpg", type: "image"), file3x: File(src: "assets/image%20with%20spaces@3x.jpg", type: "image"), width: 246, height: 246),
            lottie: Lottie(file: File(src: "assets/lottie.json", type: "raw"), loop: true, autoplay: true),
            typograph: Typograph(font: Font(file: File(src: "assets/SomeFont.ttf", type: "font"), name: "SomeFont"), fontSize: 50, color: Color(h: 0.16666666666666666, s: 1, l: 0.5, a: 1)),
            linearGradient: LinearGradient(stops: [GradientStop(position: 0, color: Color(h: 0, s: 1, l: 0.5, a: 1)), GradientStop(position: 1, color: Color(h: 0.6666666666666666, s: 1, l: 0.5, a: 1))], start: Point2D(x: 0, y: 0.5), end: Point2D(x: 1, y: 0.5)),
            point: Point2D(x: 0.5, y: 0.5)
        )
    }

    init(
        image: Image,
        lottie: Lottie,
        typograph: Typograph,
        linearGradient: LinearGradient,
        point: Point2D
    ) {
        self.image = image
        self.lottie = lottie
        self.typograph = typograph
        self.linearGradient = linearGradient
        self.point = point
    }

    public static let name = "Bindings"
}

extension Bindings: ReflectedCustomStringConvertible {
    public override var description: String {
        return reflectedDescription
    }
}

/// This is only intended to be used by Objective-C consumers.
/// In Swift use Diez<Bindings>.
@available(swift, obsoleted: 0.0.1)
@objc(DEZDiezBindings)
public final class DiezBridgedBindings: NSObject {
    @objc public init(view: UIView) {
        diez = Diez(view: view)

        super.init()
    }

    /**
     Registers the provided block for updates to the Bindings.

     The provided closure is called synchronously when this function is called.

     If in [hot mode](x-source-tag://Diez), this closure will also be called whenever changes occur to the
     component.

     - Parameter subscriber: The block to be called when the component updates.
     */
    @objc public func attach(_ subscriber: @escaping (Bindings?, NSError?) -> Void) {
        diez.attach { result in
            switch result {
            case .success(let component):
                subscriber(component, nil)
            case .failure(let error):
                subscriber(nil, error.asNSError)
            }
        }
    }

    private let diez: Diez<Bindings>
}
