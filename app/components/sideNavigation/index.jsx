import { useState } from "react";
import { useDrag } from "react-dnd";
import CancelIcon from "../icons/cancelIocn";
import TimerInput from "../drabbleComponents/timerInput";
import Question from "../drabbleComponents/question";
import ProgressBar from "../drabbleComponents/progressBar";

const TABS = [
    { name: "Question", category: "question" },
    { name: "ProgressBar", category: "progressBar" },
    { name: "TimerInput", category: "timer" },
];

const DraggableItem = ({ name, question, timer, progress }) => {
    const [{ isDragging }, dragRef] = useDrag(() => ({
        type: "ITEM",
        item: { name, question, timer, progress },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    const renderContent = () => {
        switch (name) {
            case "Question":
                return <Question question={question} />;
            case "ProgressBar":
                return <ProgressBar />;
            case "TimerInput":
                return <TimerInput />;
            default:
                return null;
        }
    };

    return (
        <div
            ref={dragRef}
            className={`p-4 mt-3 text-center cursor-pointer rounded-md ${
                isDragging ? "opacity-50" : ""
            }`}
        >
            {renderContent()}
        </div>
    );
};

const SideNavigation = ({ toggleNavProp, props }) => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isSideNavHidden, setIsSideNavHidden] = useState(false);

    const handleTabClick = (index) => setActiveIndex(index);

    const activeCategory = TABS[activeIndex]?.category;

    const filteredComponents = TABS.filter(
        (tab) => tab.category === activeCategory
    );

    const renderComponents = () =>
        filteredComponents.map((tab) => {
            switch (tab.category) {
                case "question":
                    return props.props.map((question, idx) => (
                        <DraggableItem
                            key={idx}
                            name="Question"
                            question={question}
                        />
                    ));
                case "progressBar":
                    return (
                        <DraggableItem
                            key={tab.name}
                            name="ProgressBar"
                            progress
                        />
                    );
                case "timer":
                    return (
                        <DraggableItem
                            key={tab.name}
                            name="TimerInput"
                            timer="600"
                        />
                    );
                default:
                    return null;
            }
        });

    return (
        <div
            className={`w-80 bg-white h-screen overflow-scroll p-5 gap-3 flex flex-col text-black transition-all ${
                isSideNavHidden ? "hidden" : "lg:static fixed z-[99]"
            } ${!toggleNavProp && "fixed z-[99] lg:flex"}`}
        >
            <button
                className="lg:hidden block"
                onClick={() => setIsSideNavHidden(!isSideNavHidden)}
            >
                <CancelIcon />
            </button>
            <ul className="flex justify-between gap-2 flex-wrap">
                {TABS.map((tab, index) => (
                    <li
                        key={index}
                        className={`text-[#0000006d] rounded-full w-full px-2 text-center text-sm font-Inter cursor-pointer ${
                            activeIndex === index
                                ? "bg-green-200"
                                : "bg-slate-200"
                        }`}
                        onClick={() => handleTabClick(index)}
                    >
                        {tab.name}
                    </li>
                ))}
            </ul>
            <div className="mt-5">{renderComponents()}</div>
        </div>
    );
};

export default SideNavigation;
